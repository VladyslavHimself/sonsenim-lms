import '../styles/auth.styles.scss';
import {z} from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Link, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useSignUp from "@/api/auth/useSignUp.ts";
import {RegistrationUserBodySchema} from "@sonsenim/contracts";

export default function SignUp() {
    const navigate = useNavigate();
    const { registerUser, asyncStatus } = useSignUp(() => navigate('/signIn'));
    const form = useForm<z.infer<typeof RegistrationUserBodySchema>>({
        resolver: zodResolver(RegistrationUserBodySchema)
    })

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-container-header">
                    <h1>Sign Up</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values: z.infer<typeof RegistrationUserBodySchema>) => registerUser(values))}>
                        <FormField name="username" control={form.control} render={({field, fieldState}) => (
                            <FormItem className="auth-container-form-item">
                                <FormLabel className="auth-container-input-label">Username</FormLabel>
                                <FormControl>
                                    <Input className="auth-container-input" {...field} autoCapitalize="none" />
                                </FormControl>
                                <FormMessage className="auth-container-form-message font-base" style={{color: 'red'}}>
                                    {fieldState.error?.message}
                                </FormMessage>
                            </FormItem>
                        )}/>

                        <div className="auth-container-section-field">
                            <FormField name="firstName" control={form.control} render={({field, fieldState}) => (
                                <FormItem className="auth-container-form-item divided-section">
                                    <FormLabel className="auth-container-input-label">Name</FormLabel>
                                    <FormControl>
                                        <Input className="auth-container-input" {...field} />
                                    </FormControl>
                                    <FormMessage className="auth-container-form-message font-base" style={{color: 'red'}}>
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}/>

                            <FormField name="lastName" control={form.control} render={({field, fieldState}) => (
                                <FormItem className="auth-container-form-item divided-section">
                                    <FormLabel className="auth-container-input-label">Surname</FormLabel>
                                    <FormControl>
                                        <Input className="auth-container-input" {...field} />
                                    </FormControl>
                                    <FormMessage className="auth-container-form-message font-base" style={{color: 'red'}}>
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}/>
                        </div>

                        <FormField name="email" control={form.control} render={({field, fieldState}) => (
                            <FormItem className="auth-container-form-item">
                                <FormLabel className="auth-container-input-label">Email</FormLabel>
                                <FormControl>
                                    <Input className="auth-container-input" {...field} type="email" autoCapitalize="none" />
                                </FormControl>
                                <FormMessage className="auth-container-form-message font-base" style={{color: 'red'}}>
                                    {fieldState.error?.message}
                                </FormMessage>
                            </FormItem>
                        )}/>

                        <FormField name="password" control={form.control} render={({field, fieldState}) => (
                            <FormItem className="auth-container-form-item">
                                <FormLabel className="auth-container-input-label">Password</FormLabel>
                                <FormControl>
                                    <Input type="password" className="auth-container-input" {...field} autoCapitalize="none" />
                                </FormControl>
                                <FormMessage className="auth-container-form-message font-base" style={{color: 'red'}}>
                                    {fieldState.error?.message}
                                </FormMessage>
                            </FormItem>
                        )}
                        />

                        <div className="auth-container-body">
                            <Button async asyncStatus={asyncStatus} className="auth-container-submit-button" size="lg"
                                    style={{fontFamily: 'Gilroy Bold, sans-serif', fontWeight: 'bold', fontSize: 18, borderRadius: 12, width: 400}}>
                                Create an account
                            </Button>
                            <div className="auth-container-footer">
                                <span>Still have an account?</span>
                                <Link to="/signIn">Sign In</Link>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
}