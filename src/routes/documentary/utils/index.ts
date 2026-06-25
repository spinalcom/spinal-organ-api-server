import { ISpinalAPIMiddleware } from "../../../interfaces";

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
