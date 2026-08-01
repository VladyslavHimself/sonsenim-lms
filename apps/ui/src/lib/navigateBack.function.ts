import {NavigateFunction} from "react-router-dom";

export function navigateBack(navigateProvider: NavigateFunction) {
    if (window.history.length > 2) {
        navigateProvider(-1);
    } else {
        navigateProvider('/dashboard');
    }
}