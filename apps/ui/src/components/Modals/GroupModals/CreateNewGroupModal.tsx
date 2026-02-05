import {z} from "zod";
import {Form} from "@/components/ui/form.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useCreateUserGroupMutation} from "@/api/groups/useCreateUserGroupMutation.ts";
import {groupFieldsSchema} from "@/components/Modals/GroupModals/groupFields.schema.ts";
import ModalFormFieldInput from "@/components/Modals/ui/ModalFormFieldInput/ModalFormFieldInput.tsx";
import useUserGroupsInfo from "@/api/groups/useUserGroupsInfo.ts";
import {ModalBoxBody, ModalBoxConfirmationFooter} from "@/ModalBox/ModalBoxTemplates.tsx";
import {ModalInstance} from "@/ModalBox/modalBox.ts";

type Props = {
    modal: ModalInstance
}

export default function CreateNewGroupModal({ modal }: Props) {
    const { refetch } = useUserGroupsInfo();
    const { createUserGroup } = useCreateUserGroupMutation(() => {
        modal.close(modal.id)
        refetch();
    });
    const form = useForm<z.infer<typeof groupFieldsSchema>>({
        resolver: zodResolver(groupFieldsSchema)
    });

    return (
        <>
            <ModalBoxBody>
                <Form {...form}>
                    <form id="create-group-form" onSubmit={
                        form.handleSubmit((values: z.infer<typeof groupFieldsSchema>) =>
                            createUserGroup(values.groupName))} style={{width: '100%'}}
                    >
                        <ModalFormFieldInput
                            name="groupName" form={form}
                            label="Group name" isRequired
                            placeholder="Spanish"
                        />
                    </form>
                </Form>
            </ModalBoxBody>

            <ModalBoxConfirmationFooter
                submitButtonProperties={{
                    label: 'Create',
                    formId: 'create-group-form'
                }}
            />
        </>
    );
};