import {fireEvent, render, screen} from "@testing-library/react";
import AvatarProfile from "@/components/AvatarProfile/AvatarProfile.tsx";

const navigateMock = vi.fn();

vi.mock("@/api/user/useUser.ts", () => ({
    default: () => ({
        userData: {username: "TestUser"}
    })
}));

vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {
        ...actual,
        useNavigate: () => navigateMock,
    };
});

describe('AvatarProfile', () => {
    it('should render', () => {
        render(<AvatarProfile/>)
    });

    it('Should navigate to user profile', () => {
        render(<AvatarProfile/>);
        const btn = screen.getByTestId('avatar-profile-popover-trigger')
        fireEvent.click(btn);

        const accountBtn = screen.getByText("Account");
        fireEvent.click(accountBtn);

        expect(navigateMock).toHaveBeenCalledWith("/profile");
    });
})