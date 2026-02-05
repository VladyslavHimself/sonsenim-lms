import {Button} from "@/components/ui/button.tsx";
import CreateNewGroupModal from "@/components/Modals/GroupModals/CreateNewGroupModal.tsx";
import {Modal} from "@/ModalBox/modalBox.ts";

export default function GroupsListDesktopContentHeader() {
    return (
        <>
            <h1>Groups</h1>
            <Button style={{padding: "25px 30px"}} onClick={() => {
                Modal.open((modal) => <CreateNewGroupModal modal={modal}/>, 'Create a new group');
            }}>+ Create a new group</Button>
        </>
    );
};