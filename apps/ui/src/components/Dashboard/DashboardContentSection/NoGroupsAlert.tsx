import './NoGroupsAlert.scss';

import AvatarImg from '../../../assets/Icons/scaledAvatar.png';

export default function NoGroupsAlert() {
    return (
        <div className="no-groups-alert">
            <img src={AvatarImg} alt="sad face" />
            <div>
                <h1>You haven’t any groups</h1>
                <p>Please, navigate to Groups page, to create the new one!</p>
            </div>
        </div>
    );
};