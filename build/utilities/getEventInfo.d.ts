import { ISpinalAPIMiddleware } from '../interfaces';
import { Event } from '../routes/calendar/interfacesContextsEvents';
declare function getEventInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, dynamicId: number): Promise<Event>;
export { getEventInfo };
export default getEventInfo;
