import {UserProgressionHistoryPersistence} from "../models/persistence/UserProgressionHistory.persistence";
import {ProgressionHistoryEntity} from "../models/domain/ProgressionHistoryEntityModel";

export function getBaseProgressionHistoryFields(entity: UserProgressionHistoryPersistence): ProgressionHistoryEntity {
    return {
        id: entity.id,
        groupId: entity.group_id,
        highIndicationCount: entity.high_indication_count,
        midIndicationCount: entity.mid_indication_count,
        lowIndicationCount: entity.low_indication_count,
        veryLowIndicationCount: entity.very_low_indication_count,
        createdAt: entity.created_at,
        updatedAt: entity.updated_at
    }
}

export const progressionHistoryMapper = {
    toDTO(entity: UserProgressionHistoryPersistence): ProgressionHistoryEntity {
        return getBaseProgressionHistoryFields(entity);
    },

    toDTOList(entities: UserProgressionHistoryPersistence[]): ProgressionHistoryEntity[] {
        return entities.map(progressionHistoryMapper.toDTO);
    }
};