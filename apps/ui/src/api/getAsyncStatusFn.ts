export function getAsyncStatus(isIdle: boolean, isPending: boolean, isError: boolean, isSuccess: boolean) {
    if (isIdle) return "idle";
    if (isPending) return "pending";
    if (isError) return "error";
    if (isSuccess) return "success";
}