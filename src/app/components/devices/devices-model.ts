export interface Device {
    obs: string;
    info: Record<string, any>; // o un objeto más específico si conocés las claves
    account: string | null;
    name: string | null;
    brand: string;
    ltime: string;             // formato "DD HH:MM:SS"
    state: string;             // ej. "new"
    dueday: string | null;
    lastip: string;
    status: "enabled" | "disabled" | string;
    barcode: string;
    lastecm: string;           // formato "DD HH:MM:SS"
    clientid: number | null;
    deviceid: number;
    location: string;
    password: string;
    tenantid: string;
    username: string;
    lastchannel: string;       // formato "()" o el canal actual
    clientstatus: "online" | "offline" | string;
    activationdate: string | null; // o Date si querés convertirlo
}