import { ISpinalAPIMiddleware } from "../../../interfaces";
import { SpinalContext, SpinalGraph, SpinalNode } from "spinal-env-viewer-graph-service";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { FileSystem } from "spinal-core-connectorjs";
import serviceDocumentation, { SpinalDocument, TO_FILE_RELATION, TO_FOLDER_RELATION, TO_ROOT_DIRECTORY_RELATION } from "spinal-env-viewer-plugin-documentation-service";

function createUrl(urlStr: string, port?: number | string, protocol: string = "http"): URL {
	urlStr = urlStr.startsWith(protocol) ? urlStr : `${protocol}://${urlStr}`;
	urlStr = typeof port !== "undefined" ? `${urlStr}:${port}` : urlStr;
	const url = new URL(urlStr);
	return url;
}

export function getHubUrl(spinalAPIMiddleware: ISpinalAPIMiddleware): string {
	const hubUrl = createUrl(spinalAPIMiddleware.config.spinalConnector.host, spinalAPIMiddleware.config.spinalConnector.port, spinalAPIMiddleware.config.spinalConnector.protocol);
	return hubUrl.toString();
}

export const SERVER_ID_TIMEOUT_MS = 30000;

// Resolves once the hub has assigned a definitive _server_id to the model. A model created locally first
// gets a temporary id (kept in FileSystem._tmp_objects, never a multiple of 4) when it is sent to the hub;
// FileSystem._tmp_id_to_real then replaces it with the real id and registers the model in
// FileSystem._objects, which is what is checked here (same test as utilities/awaitSync). Rejects with a
// 503 error if the hub does not answer within timeoutMs.
export function waitUntilServerIdNotDefined(node: any, timeoutMs: number = SERVER_ID_TIMEOUT_MS): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();

		const checkCondition = () => {
			if (hasDefinitiveServerId(node)) {
				resolve(true);
				return;
			}

			if (Date.now() - startTime >= timeoutMs) {
				reject({ code: 503, message: `The hub did not confirm the creation of the object within ${timeoutMs / 1000} s, try again later` });
				return;
			}

			setTimeout(checkCondition, 100);
		};

		checkCondition();
	});
}

export function hasDefinitiveServerId(node: any): boolean {
	const serverId = node?._server_id;
	return typeof serverId === "number" && FileSystem._objects[serverId] === node;
}

// Serializes the tasks sharing the same key (in memory, so only within this process).
const exclusiveTasks = new Map<string, Promise<unknown>>();

export function runExclusive<T>(key: string, task: () => Promise<T>): Promise<T> {
	const previous = exclusiveTasks.get(key) || Promise.resolve();
	const result = previous.then(task, task);
	const tail = result.catch(() => undefined);
	exclusiveTasks.set(key, tail);
	tail.then(() => {
		if (exclusiveTasks.get(key) === tail) exclusiveTasks.delete(key);
	});
	return result;
}

// Names compared case-insensitively, surrounding spaces ignored.
export function normalizeFileName(name: string): string {
	return String(name ?? "")
		.normalize("NFC")
		.trim()
		.toLocaleLowerCase();
}

export interface INameConflict {
	code: number;
	message: string;
}

// A directory or a file is designated by its node or by its document model (the id listed by file_in_tree):
// returns the node in both cases, null for anything else.
export async function toDocumentaryNode(loaded: SpinalNode | SpinalDocument | null | undefined): Promise<SpinalNode | null> {
	if (loaded instanceof SpinalDocument) return ((await loaded.getNode()) as SpinalNode) ?? null;
	return loaded instanceof SpinalNode ? loaded : null;
}

// Normalized names being created under a parent (key: parent _server_id), not yet visible in its children.
const pendingChildNames = new Map<number, Set<string>>();

// Reserves names under a directory (or context) so that no two children share the same name.
// Returns, for each requested name, null if it is reserved or the error explaining why it is not
// (409 for a name already used, 400 for an empty name); release()
// must be called once the creation is finished (whatever its result). The pending reservations are
// read before the children are loaded, so a creation that completes during the loading is still seen.
export function reserveChildNames(parent: SpinalNode, names: string[]): Promise<{ conflicts: (INameConflict | null)[]; release: () => void }> {
	const parentKey = parent._server_id as number;

	return runExclusive(`documentary-names:${parentKey}`, async () => {
		const pending = pendingChildNames.get(parentKey) || new Set<string>();
		const pendingBefore = new Set(pending);

		const children = await parent.getChildren([TO_FILE_RELATION, TO_FOLDER_RELATION]);
		const existing = new Set(children.map((child) => normalizeFileName(child.getName().get())));

		const reserved: string[] = [];
		const conflicts = names.map((name): INameConflict | null => {
			const key = normalizeFileName(name);
			if (!key) return { code: 400, message: "Name is empty" };
			if (existing.has(key) || pendingBefore.has(key) || pending.has(key)) return { code: 409, message: `An item named "${name}" already exists in this directory` };
			if (reserved.includes(key)) return { code: 409, message: `The name "${name}" is used more than once in the request` };
			reserved.push(key);
			return null;
		});

		for (const key of reserved) pending.add(key);
		if (pending.size > 0) pendingChildNames.set(parentKey, pending);

		const release = () => {
			for (const key of reserved) pending.delete(key);
			if (pending.size === 0 && pendingChildNames.get(parentKey) === pending) pendingChildNames.delete(parentKey);
		};

		return { conflicts, release };
	});
}

export function _formatFileNode(node: SpinalNode | SpinalFile | SpinalDocument): any {
	return {
		dynamicId: node._server_id,
		name: node?.info?.name?.get() || node?.name?.get(),
		type: node?.info?.type?.get() || node?.type?.get(),
	};
}

export function _formatFileVersion(version: any, fileName: string): any {
	return {
		name: fileName,
		versionId: version.id.get(),
		versionName: version.version.get(),
	};
}

export async function getFileAttributes(node: SpinalNode) {
	const categories = await serviceDocumentation.getCategory(node);
	return categories
		.map((category) => {
			const res = [];

			for (const attribute of Array.from(category.element)) {
				const attr = attribute.get();
				attr.categoryName = category.nameCat;
				res.push(attr);
			}

			return res;
		})
		.flat();
}

export async function getContexts(filenode: SpinalNode, graph: SpinalGraph): Promise<SpinalContext[]> {
	const contexts: SpinalContext[] = await graph.getChildren("hasContext");
	return contexts.reduce((acc: any[], context: SpinalContext) => {
		if (filenode.belongsToContext(context) || filenode._server_id === context._server_id) {
			acc.push(context);
		}

		return acc;
	}, []);
}

export async function getParents(node: SpinalNode, contexts: SpinalContext[]): Promise<any[]> {
	const parents = await node.getParents();
	const result = [];

	for (const parent of parents) {
		// A root directory is replaced by the node(s) owning it; kept as is if no owner is found.
		const owners = isRootDirectoryNode(parent) ? await getRootParents(parent) : [];
		for (const node of owners.length > 0 ? owners : [parent]) {
			const context = isInContext(node, contexts);
			result.push(formatParentNode(node, context));
		}
	}

	return result;
}

function isInContext(node: SpinalNode, contexts: SpinalContext[]) {
	return contexts.find((context) => node.belongsToContext(context) || node._server_id === context._server_id);
}

function formatParentNode(parent: SpinalNode, context?: SpinalContext) {
	return {
		dynamicId: parent._server_id,
		...parent.info.get(),
		contextDynamicId: context?._server_id,
	};
}

function getRootParents(rootNode: SpinalNode): Promise<SpinalNode[]> {
	return rootNode.getParents([TO_ROOT_DIRECTORY_RELATION]);
}

// Same rule as isRootDirectoryNode in spinal-env-viewer-plugin-documentation-service, which the package
// does not export: the root directory of a node's files is the node another node points to through
// "hasFiles", whatever its format ("<name>_root_directory" or the legacy "[Files]" reused when a file
// is linked to that node). Synchronous: reads node.parents without loading anything. Removing a
// relation leaves an empty list, hence the length check.
function isRootDirectoryNode(node: SpinalNode): boolean {
	const rootParents = node.parents.getElement(TO_ROOT_DIRECTORY_RELATION);
	return !!rootParents && rootParents.length > 0;
}
