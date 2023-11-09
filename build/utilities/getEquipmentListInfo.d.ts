import { Equipement } from '../routes/geographicContext/interfacesGeoContext';
import { ISpinalAPIMiddleware } from '../interfaces';
declare function getEquipmentListInfo(spinalAPIMiddleware: ISpinalAPIMiddleware, profileId: string, roomId: number): Promise<Equipement[]>;
export { getEquipmentListInfo };
export default getEquipmentListInfo;
