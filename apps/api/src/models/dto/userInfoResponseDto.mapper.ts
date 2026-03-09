import {UserInfoResponse} from "@sonsenim/contracts";
import {LocalUser} from "../domain/LocalUser.model";

export const userInfoResponseDtoMapper = {
    toDTO: (user: LocalUser, totalDecks: number, totalCards: number): UserInfoResponse => {
        const {id, username, firstName, lastName, email, updatedAt, createdAt, ...slicedFields} = user;

        return ({id, username, firstName, lastName, email, updatedAt, createdAt, totalCards, totalDecks})
    }
};