interface CloudflareWrapWithValues<T> {
    value: T
}

export default async function unwrapBody<T>(body: Promise<CloudflareWrapWithValues<T>>) {
    return {...await body}.value
}