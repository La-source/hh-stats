
export enum SettingField {
    notif_pachinfo = "notif_pachinfo",
    notif_shop = "notif_shop",
    notif_arena = "notif_arena",
}

export class Setting {
    public field: SettingField;

    public value: "on" | "off";
}
