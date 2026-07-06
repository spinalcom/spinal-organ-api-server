import { ISpinalAPIMiddleware } from "../../../interfaces";
import { SpinalNode } from "spinal-env-viewer-graph-service";
import { File as SpinalFile } from "spinal-core-connectorjs_type";
import { SpinalDocument } from "spinal-env-viewer-plugin-documentation-service";

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
