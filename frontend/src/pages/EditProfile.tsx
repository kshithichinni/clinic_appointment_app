import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import {
  FaUserCircle,
  FaUser,
  FaPhoneAlt,
  FaStethoscope,
  FaBriefcase,
} from "react-icons/fa";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  contactInfo: yup.string(),
  specialization: yup.string(),
  experience: yup
    .number()
    .typeError("Experience must be a number")
    .positive("Experience must be positive")
    .integer("Experience must be an integer")
    .nullable()
    .transform((value, originalValue) =>
      String(originalValue).trim() === "" ? null : value
    ), // Allow optional empty
});

type FormInputs = yup.InferType<typeof schema>;

const EditProfile = () => {
  const { token, user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState<FormInputs>({
    name: "",
    contactInfo: "",
    specialization: "",
    experience: undefined,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        const profileData: FormInputs = {
          name: data.user?.name || "",
          contactInfo: data.doctor?.contactInfo || "",
          specialization: data.doctor?.specialization || "",
          experience:
            data.doctor?.experience !== undefined
              ? Number(data.doctor.experience)
              : undefined,
        };

        setInitialValues(profileData);
        reset(profileData);
      } catch (err: any) {
        toast.error(err.response?.data?.message || "❌ Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, reset]);

  const onSubmit = async (data: FormInputs) => {
    const toastId = toast.loading("Updating profile...");
    try {
      await axios.put("http://localhost:5000/api/users/profile", data, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Update the entire user profile in context if applicable, here only name.
      updateUser({ name: data.name });

      setInitialValues(data);
      reset(data);
      toast.success("Profile updated successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile", {
        id: toastId,
      });
    }
  };

  const handleClear = () => {
    reset(initialValues);
    toast("Form reset to last saved values", { icon: "🔄" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-28 px-4 flex items-center justify-center">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-xl p-8">
        <div className="flex flex-col items-center mb-6">
          <FaUserCircle className="text-blue-600 text-6xl mb-2" />
          <h2 className="text-3xl font-bold text-blue-700 text-center">
            Edit Profile
          </h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
              <FaUser /> Name
            </label>
            <input
              {...register("name")}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter your name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
              <FaPhoneAlt /> Contact Info
            </label>
            <input
              {...register("contactInfo")}
              className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter contact number or email"
            />
            {errors.contactInfo && (
              <p className="text-red-500 text-sm mt-1">
                {errors.contactInfo.message}
              </p>
            )}
          </div>

          {user?.role === "doctor" && (
            <>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
                  <FaStethoscope /> Specialization
                </label>
                <input
                  {...register("specialization")}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Cardiologist"
                />
                {errors.specialization && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.specialization.message}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1 gap-2">
                  <FaBriefcase /> Experience (years)
                </label>
                <input
                  type="number"
                  {...register("experience")}
                  className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. 5"
                />
                {errors.experience && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.experience.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="flex justify-between mt-6 gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition font-semibold"
            >
              {isSubmitting ? "Saving..." : "Update Profile"}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition font-semibold"
            >
              Clear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
