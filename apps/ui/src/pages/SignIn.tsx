import '../styles/auth.styles.scss';
import Logotype from '../assets/logo.png';
import {Input} from "@/components/ui/input.tsx";
import {Checkbox} from "@/components/ui/checkbox.tsx";
import {Link, NavLink, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {FormControl, FormField, FormItem, FormLabel, Form} from "@/components/ui/form.tsx";
import useSignIn from "@/api/auth/useAuth.ts";
import {useAuth} from "@/security/AuthProvider.tsx";
import {useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";

const signInSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters"
    }),
    password: z.string().min(4, {
        message: "Password must be at least 4 characters"
    }),
})


export default function SignIn() {
    const { userInfo, setUserInfo } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { loginUser } = useSignIn(() => {
        queryClient.invalidateQueries({queryKey: ['user-info-me']}).then(r => setUserInfo(r));
    });
    const form = useForm<z.infer<typeof signInSchema>>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: ""
        }
    })

    useEffect(() => {
        if (userInfo?.id) {
            navigate('/dashboard', { replace: true });
            return;
        }
    }, [userInfo, navigate]);

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-container-header">
                    <img src={Logotype} alt="logo" />
                    <h1>Sign In</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values: z.infer<typeof signInSchema>) => loginUser(values))}>
                        <FormField name="username" control={form.control} render={({field}) => (
                            <FormItem style={{ width: 330, marginTop: 15}}>
                                <FormLabel className="auth-container-input-label">Username</FormLabel>
                                <FormControl>
                                    <Input className="auth-container-input" {...field} />
                                </FormControl>
                            </FormItem>
                        )}/>

                        <FormField name="password" control={form.control} render={({field}) => (
                            <FormItem style={{ marginTop: 15}}>
                                <FormLabel className="auth-container-input-label">Password</FormLabel>
                                <FormControl>
                                    <Input type="password" className="auth-container-input" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                        />

                        <div className="auth-container-body">
                            <div className="auth-container-options-field" style={{marginTop: 27}}>
                                <div className="auth-container-options-checkbox">
                                    <Checkbox id="rememberPassword"/>
                                    <label
                                        htmlFor="rememberPassword"
                                        className="text-lg ml-1.5 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Remember me
                                    </label>
                                </div>

                                <NavLink to="#">Forgot password?</NavLink>
                            </div>
                            <Button className="auth-container-submit-button" size="lg"
                                    style={{fontFamily: 'Gilroy Bold', fontSize: 18, borderRadius: 12, width: 300}}>
                                Sign in
                            </Button>
                        </div>
                    </form>
                </Form>
                <div className="auth-container-footer">
                    <span>Don't have an account?</span>
                    <Link to="/signUp">Sign Up</Link>
                </div>
            </div>
        </div>
    );
}