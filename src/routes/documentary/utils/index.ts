import { ISpinalAPIMiddleware } from "../../../interfaces";
import { SpinalContext, SpinalGraph, SpinalNode } from "spinal-env-viewer-graph-service";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import serviceDocumentation, { DIRECTORY_NODE_TYPE, SpinalDocument } from "spinal-env-viewer-plugin-documentation-service";

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

export function waitUntilServerIdNotDefined(node: any): Promise<boolean> {
	return new Promise((resolve, reject) => {
		const startTime = Date.now();

		const checkCondition = () => {
			if (typeof node._server_id !== "undefined") {
				resolve(true);
				return;
			}

			setTimeout(checkCondition, 500);
		};

		checkCondition();
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

	for (let parent of parents) {
		const isRoot = isRootDirectoryNode(parent);
		if (isRoot) parent = (await getRootParent(parent)) || parent;
		const context = isInContext(parent, contexts);
		result.push(formatParentNode(parent, context));
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

async function getRootParent(rootNode: SpinalNode): Promise<SpinalNode | null> {
	const parents = await rootNode.getParents();
	return parents.length > 0 ? parents[0] : null;
}

function isRootDirectoryNode(node: SpinalNode): boolean {
	return node.getType().get() == DIRECTORY_NODE_TYPE && node.getName().get().endsWith("_root_directory");
}
