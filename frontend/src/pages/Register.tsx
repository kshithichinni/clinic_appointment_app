import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Shield, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import registerImg from "../assets/register.svg";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Min 6 characters").required("Password is required"),
  role: yup.string().oneOf(["patient", "doctor", "admin"], "Role is required").required(),
});

type RegisterFormInputs = yup.InferType<typeof schema>;

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", data);
      toast.success("Registration successful! Please log in.");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-28 px-4 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 overflow-hidden">
        {/* Left Illustration */}
        <div className="hidden md:flex bg-blue-100 items-center justify-center p-8">
          <img src={registerImg} alt="Register Illustration" className="max-h-[400px]" />
        </div>

        {/* Right Form */}
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">Create Account</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <div>
              <label className="text-sm font-medium">Name</label>
              <div className="flex items-center border rounded-md px-3 py-2 mt-1">
                <User className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  {...register("name")}
                  placeholder="Enter name"
                  className="w-full outline-none"
                />
              </div>
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium">Email</label>
              <div className="flex items-center border rounded-md px-3 py-2 mt-1">
                <Mail className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  {...register("email")}
                  placeholder="Enter email"
                  className="w-full outline-none"
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            {/* Password with Toggle */}
            <div>
              <label className="text-sm font-medium">Password</label>
              <div className="flex items-center border rounded-md px-3 py-2 mt-1">
                <Lock className="w-4 h-4 text-gray-500 mr-2" />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  placeholder="Enter password"
                  className="w-full outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="ml-2 focus:outline-none text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium">Role</label>
              <div className="flex items-center border rounded-md px-3 py-2 mt-1">
                <Shield className="w-4 h-4 text-gray-500 mr-2" />
                <select {...register("role")} className="w-full outline-none bg-transparent">
                  <option value="">Select role</option>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition duration-300"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>

            {/* Link to Login */}
            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline font-medium">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
