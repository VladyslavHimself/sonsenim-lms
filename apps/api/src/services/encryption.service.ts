import {verify, hash, argon2id} from 'argon2';

const createEncryptionService = (config: {
    timeCost: number,
    memoryCost: number,
    parallelism: number
}) => {

    function encryptPassword(password: string) {
        return hash(password, {
            type: argon2id,
            ...config
        });
    }

    function verifyPassword(password: string, hash: string) {
        return verify(password, hash);
    }

    return { encryptPassword, verifyPassword };
}

export default createEncryptionService;