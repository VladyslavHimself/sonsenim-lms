import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar.tsx";
import AvatarLogo from "@/assets/Icons/avatar.png";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover.tsx";
import {ChevronDown, LifeBuoyIcon, MailsIcon} from "lucide-react";
import useUser from "@/api/user/useUser.ts";
import './AvatarProfile.scss';
import {Button} from "@/components/ui/button.tsx";
import {AvatarIcon} from "@radix-ui/react-icons";
import {useNavigate} from "react-router-dom";

export default function AvatarProfile() {
    const { userData } = useUser();
    const navigate = useNavigate();


    return (
        <div className="avatar-profile">
            <Avatar>
                <AvatarImage src={AvatarLogo} alt="avatar"/>
                <AvatarFallback>:)</AvatarFallback>
            </Avatar>
            <span className="avatar-profile-username">{userData?.username}</span>
            <Popover>
                <PopoverTrigger data-testid="avatar-profile-popover-trigger"><ChevronDown color="orange"/></PopoverTrigger>
                { /* @ts-expect-error popover mismatch param */}
                <PopoverContent sideOffset="2" align="end" className="profile-popover">
                    <Button variant="ghost" onClick={() => navigate('/profile')}><AvatarIcon style={{ width: 32, height: 32}} />Account</Button>
                    <Button variant="ghost"><MailsIcon style={{ width: 30, height: 30}} />Notifications</Button>
                    <Button variant="ghost"><LifeBuoyIcon style={{ width: 30, height: 30}} />Support</Button>
                </PopoverContent>
            </Popover>
        </div>
    );
}