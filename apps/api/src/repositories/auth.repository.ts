export default function createAuthRepository(deps: {
    db: any
}) {
    const {db} = deps;

    async function saveRefreshToken(userId: string, refreshTokenHash: string) {
        await db`INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
           VALUES (${userId}, ${refreshTokenHash}, NOW() + INTERVAL '30 days')`
    }

    async function findRefreshToken(refreshTokenHash: string) {
        const rows = await db`SELECT * FROM refresh_tokens WHERE token_hash = ${refreshTokenHash} LIMIT 1`

        if (!rows.length) return null;

        return rows[0];
    }

    async function deleteRefreshToken(refreshTokenHash: string) {
        await db`DELETE FROM refresh_tokens WHERE token_hash = ${refreshTokenHash}`;
    }

    return {saveRefreshToken, findRefreshToken, deleteRefreshToken}
}