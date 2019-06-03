
export function getVersion(): string {
    return process.env.npm_package_version || "v";
}
