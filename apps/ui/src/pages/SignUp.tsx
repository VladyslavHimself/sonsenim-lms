import '../styles/auth.styles.scss';
import {z} from "zod";
import {Form, FormControl, FormField, FormItem, FormLabel} from "@/components/ui/form.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Link, useNavigate} from "react-router-dom";
import {Button} from "@/components/ui/button.tsx";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useSignUp from "@/api/auth/useSignUp.ts";

// TODO: Make more shapes
const signUpSchema = z.object({
    username: z.string().min(2, {
        message: "Username must be at least 2 characters"
    }),
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string()
        .min(1, { message: "This field has to be filled." })
        .email("This is not a valid email."),
    password: z.string().min(4, {
        message: "Password must be at least 4 characters"
    }),
})

export default function SignUp() {
    const navigate = useNavigate();
    const { registerUser } = useSignUp(() => navigate('/signIn'));
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema)
    })

    return (
        <div className="auth-wrapper">
            <div className="auth-container">
                <div className="auth-container-header">
                    <h1>Sign Up</h1>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((values: z.infer<typeof signUpSchema>) => registerUser(values))}>
                        <FormField name="username" control={form.control} render={({field}) => (
                            <FormItem className="auth-container-form-item">
                                <FormLabel className="auth-container-input-label">Username</FormLabel>
                                <FormControl>
                                    <Input className="auth-container-input" {...field} />
                                </FormControl>
                            </FormItem>
                        )}/>

                        <div className="auth-container-section-field">
                            <FormField name="firstName" control={form.control} render={({field}) => (
                                <FormItem className="auth-container-form-item divided-section">
                                    <FormLabel className="auth-container-input-label">Name</FormLabel>
                                    <FormControl>
                                        <Input className="auth-container-input" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}/>

                            <FormField name="lastName" control={form.control} render={({field}) => (
                                <FormItem className="auth-container-form-item divided-section">
                                    <FormLabel className="auth-container-input-label">Surname</FormLabel>
                                    <FormControl>
                                        <Input className="auth-container-input" {...field} />
                                    </FormControl>
                                </FormItem>
                            )}/>
                        </div>

                        <FormField name="email" control={form.control} render={({field}) => (
                            <FormItem className="auth-container-form-item">
                                <FormLabel className="auth-container-input-label">Email</FormLabel>
                                <FormControl>
                                    <Input className="auth-container-input" {...field} />
                                </FormControl>
                            </FormItem>
                        )}/>

                        <FormField name="password" control={form.control} render={({field}) => (
                            <FormItem className="auth-container-form-item">
                                <FormLabel className="auth-container-input-label">Password</FormLabel>
                                <FormControl>
                                    <Input type="password" className="auth-container-input" {...field} />
                                </FormControl>
                            </FormItem>
                        )}
                        />

                        <div className="auth-container-body">
                            <Button className="auth-container-submit-button" size="lg"
                                    style={{fontFamily: 'Gilroy Bold', fontSize: 18, borderRadius: 12, width: 400}}>
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