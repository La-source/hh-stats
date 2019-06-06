
export enum SettingField {
    notif_pachinfo = "notif_pachinfo",
    notif_shop = "notif_shop",
    notif_arena = "notif_arena",
    notif_energy_full = "notif_energy_full",
}

export class Setting {
    public field: SettingField;

    public value: "on" | "off";
}
