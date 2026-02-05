import React from 'react'
import ReactDOM from 'react-dom/client'
import {createBrowserRouter, RouterProvider} from "react-router-dom";
import SignIn from "./pages/SignIn.tsx";
import SignUp from "./pages/SignUp.tsx";
import {AuthProvider} from "./security/AuthProvider.tsx";
import Dashboard from "./pages/Dashboard/Dashboard.tsx";
import ProtectedRoute from "./security/ProtectedRoute.tsx";
import './index.css';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {RootResolver} from "@/RootResolver.tsx";
import {Toaster} from "@/components/ui/toaster.tsx";
import GroupsList from "@/pages/GroupsList/GroupsList.tsx";
import SelectedGroupPage from "@/pages/SelectedGroupPage.tsx";
import CardListPage from "@/pages/CardListPage.tsx";
import MemoizationPage from "@/pages/Memoization/MemoizationPage.tsx";
import MemoizationPageProvider from "@/pages/Memoization/MemoizationPageProvider.tsx";
import MemoizationReview from "@/pages/MemoizationReview.tsx";
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'
import Profile from "@/pages/Profile/Profile.tsx";
import Navbar from "@/pages/Navigation/Navbar.tsx";
import ModalBoxProvider from "@/ModalBox/ModalBoxProvider.tsx";

const router = createBrowserRouter([
    {
        element: <Navbar/>,
        children: [
            {
                path: '/',
                element: <RootResolver/>
            },
            {
                path: '/signIn',
                element: <SignIn/>
            },
            {
                path: '/signup',
                element: <SignUp/>
            },
            {
                path: '/profile',
                element: (
                    <ProtectedRoute>
                        <Profile/>
                    </ProtectedRoute>
                )
            },
            {
                path: '/dashboard',
                element: <ProtectedRoute><Dashboard/></ProtectedRoute>
            },
            {
                path: '/groups',
                element: <ProtectedRoute><GroupsList/></ProtectedRoute>,
            },
            {
                path: '/groups/:groupId',
                element: <ProtectedRoute><SelectedGroupPage/></ProtectedRoute>
            },
            {
                path: '/groups/:groupId/card-list/:deckId',
                element: <ProtectedRoute><CardListPage/></ProtectedRoute>
            },
            {
                path: '/memoization/:deckId',
                element: (
                    <ProtectedRoute>
                        <MemoizationPageProvider>
                            <MemoizationPage/>
                        </MemoizationPageProvider>
                    </ProtectedRoute>
                )
            },
            {
                path: '/memoization/review',
                element: (
                    <ProtectedRoute>
                        <MemoizationReview/>
                    </ProtectedRoute>
                )
            }
        ]
    }
])

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <ModalBoxProvider>
                    <Toaster/>
                    <div className="app-container">
                        <RouterProvider router={router}/>
                    </div>
                </ModalBoxProvider>
            </AuthProvider>
            <ReactQueryDevtools initialIsOpen={false}/>
        </QueryClientProvider>
    </React.StrictMode>,
)