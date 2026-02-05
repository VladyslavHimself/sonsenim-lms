import {useForm} from "react-hook-form";
import {z} from "zod";
import {groupFieldsSchema} from "@/components/Modals/GroupModals/groupFields.schema.ts";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form.tsx";
import {UserGroupsInfoResponse} from "@/api/groups/groups.ts";
import {Trash2Icon} from "lucide-react";
import {useDeleteUserGroupMutation} from "@/api/groups/useDeleteUserGroupMutation.ts";
import {useUpdateUserGroupMutation} from "@/api/groups/useUpdateUserGroupMutation.ts";
import ModalFormFieldInput from "@/components/Modals/ui/ModalFormFieldInput/ModalFormFieldInput.tsx";
import {ModalBoxBody, ModalBoxConfirmationFooter} from "@/ModalBox/ModalBoxTemplates.tsx";
import {Modal} from "@/ModalBox/modalBox.ts";

type Props = {
    currentGroup: UserGroupsInfoResponse,
    modal?: {
        id: string,
        close: () => void,
    },
    refetchGroups: () => void,
}

export function EditGroupModal({modal, refetchGroups, currentGroup}: Props) {
    const {deleteUserGroup} = useDeleteUserGroupMutation(onMakeModalAction);
    const {updateUserGroup} = useUpdateUserGroupMutation(onMakeModalAction);

    const form = useForm<z.infer<typeof groupFieldsSchema>>({
        resolver: zodResolver(groupFieldsSchema),
        defaultValues: {
            groupName: currentGroup.groupName,
        }
    });

    return (
        <>
            <ModalBoxBody>
                <div>
                    <Form {...form}>
                        <form id="edit-group-form" onSubmit={
                            form.handleSubmit((values: z.infer<typeof groupFieldsSchema>) => {
                                updateUserGroup({
                                    groupId: currentGroup.groupId,
                                    groupBody: values
                                });
                            })
                        }>
                            <ModalFormFieldInput
                                name="groupName" form={form}
                                label="Group" isRequired
                                placeholder="Spanish"
                            />
                        </form>
                    </Form>
                </div>
            </ModalBoxBody>
            <ModalBoxConfirmationFooter
                closeButtonProperties={{
                    label: <Trash2Icon/>,
                    action: () => deleteUserGroup(currentGroup.groupId)
                }}

                submitButtonProperties={{
                    label: 'Edit',
                    formId: 'edit-group-form',
                    restProps: {disabled: form.getValues().groupName === currentGroup.groupName}
                }}

            />
        </>
    );

    function onMakeModalAction() {
        refetchGroups();
        Modal.close(modal!.id);
    }
}