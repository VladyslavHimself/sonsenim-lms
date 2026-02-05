import {useLocation} from "react-router-dom";

const HIDDEN_IN_PAGES_BY_DEFAULT = ['signIn', 'signUp', 'memoization'];

export default function useNavigationStatus() {
    const location = useLocation();
    const hiddenPagesRegex = new RegExp(HIDDEN_IN_PAGES_BY_DEFAULT.join("|"));

    return !hiddenPagesRegex.test(location.pathname);
}