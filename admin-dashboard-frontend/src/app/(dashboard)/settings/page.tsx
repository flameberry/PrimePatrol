import Image from "next/image";
import { Metadata } from "next";
import Breadcrumb from "@/components/BreadCrumbs";

export const metadata: Metadata = {
  title: "Settings Page | Next.js E-commerce Dashboard Template",
  description: "This is the settings page for ShakibAdmin Next.js",
};

const SettingsPage = () => {
  return (
    <>
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumb pageName="Settings" />

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mt-8">
          {/* Form Section */}
          <div className="col-span-1 xl:col-span-3">
            <div className="rounded-md border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
              {/* Section Title */}
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Personal Information
                </h3>
              </div>

              {/* Form Fields */}
              <div className="p-7">
                <form action="#">
                  {/* Name and Phone Number Fields */}
                  <div className="flex flex-col gap-5.5 mb-5.5 sm:flex-row">
                    {/* Full Name */}
                    <div className="w-full sm:w-1/2">
                      <label
                        htmlFor="fullName"
                        className="block mb-3 text-sm font-medium text-black dark:text-white"
                      >
                        Full Name
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-4">
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M3.72039 12.887C4.50179 12.1056 5.5616 11.6666 6.66667 11.6666H13.3333C14.4384 11.6666 15.4982 12.1056 16.2796 12.887C17.061 13.6684 17.5 14.7282 17.5 15.8333V17.5C17.5 17.9602 17.1269 18.3333 16.6667 18.3333C16.2064 18.3333 15.8333 17.9602 15.8333 17.5V15.8333C15.8333 15.1703 15.5699 14.5344 15.1011 14.0655C14.6323 13.5967 13.9964 13.3333 13.3333 13.3333H6.66667C6.00363 13.3333 5.36774 13.5967 4.8989 14.0655C4.43006 14.5344 4.16667 15.1703 4.16667 15.8333V17.5C4.16667 17.9602 3.79357 18.3333 3.33333 18.3333C2.8731 18.3333 2.5 17.9602 2.5 17.5V15.8333C2.5 14.7282 2.93899 13.6684 3.72039 12.887Z"
                                fill="currentColor"
                              />
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M9.99967 3.33329C8.61896 3.33329 7.49967 4.45258 7.49967 5.83329C7.49967 7.214 8.61896 8.33329 9.99967 8.33329C11.3804 8.33329 12.4997 7.214 12.4997 5.83329C12.4997 4.45258 11.3804 3.33329 9.99967 3.33329ZM5.83301 5.83329C5.83301 3.53211 7.69849 1.66663 9.99967 1.66663C12.3009 1.66663 14.1663 3.53211 14.1663 5.83329C14.1663 8.13448 12.3009 9.99996 9.99967 9.99996C7.69849 9.99996 5.83301 8.13448 5.83301 5.83329Z"
                                fill="currentColor"
                              />
                            </g>
                          </svg>
                        </span>
                        <input
                          type="text"
                          id="fullName"
                          name="fullName"
                          className="w-full rounded border border-stroke bg-gray py-3 pl-11 pr-4.5 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white focus:border-primary focus-visible:outline-none"
                          placeholder="Soham Kelaskar"
                          defaultValue="Soham Kelaskar"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="w-full sm:w-1/2">
                      <label
                        htmlFor="phoneNumber"
                        className="block mb-3 text-sm font-medium text-black dark:text-white"
                      >
                        Phone Number
                      </label>
                      <input
                        type="text"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white focus:border-primary focus-visible:outline-none"
                        placeholder="+880 3343 7865"
                        defaultValue="+880 3343 7865"
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="mb-5.5">
                    <label
                      htmlFor="emailAddress"
                      className="block mb-3 text-sm font-medium text-black dark:text-white"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-4">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.8">
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M3.33301 4.16667C2.87658 4.16667 2.49967 4.54357 2.49967 5V15C2.49967 15.4564 2.87658 15.8333 3.33301 15.8333H16.6663C17.1228 15.8333 17.4997 15.4564 17.4997 15V5C17.4997 4.54357 17.1228 4.16667 16.6663 4.16667H3.33301ZM0.833008 5C0.833008 3.6231 1.9561 2.5 3.33301 2.5H16.6663C18.0432 2.5 19.1663 3.6231 19.1663 5V15C19.1663 16.3769 18.0432 17.5 16.6663 17.5H3.33301C1.9561 17.5 0.833008 16.3769 0.833008 15V5Z"
                              fill="currentColor"
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.983719 4.52215C1.24765 4.1451 1.76726 4.05341 2.1443 4.31734L9.99975 9.81615L17.8552 4.31734C18.2322 4.05341 18.7518 4.1451 19.0158 4.52215C19.2797 4.89919 19.188 5.4188 18.811 5.68272L10.4776 11.5161C10.1841 11.7236 9.81539 11.7236 9.52189 11.5161L1.18847 5.68272C0.811429 5.4188 0.71979 4.89919 0.983719 4.52215Z"
                              fill="currentColor"
                            />
                          </g>
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="emailAddress"
                        name="emailAddress"
                        className="w-full rounded border border-stroke bg-gray py-3 pl-11 pr-4.5 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white focus:border-primary focus-visible:outline-none"
                        placeholder="soham@gmail.com"
                        defaultValue="soham@gmail.com"
                      />
                    </div>
                  </div>

                  {/* Username Field */}
                  <div className="mb-5.5">
                    <label
                      htmlFor="username"
                      className="block mb-3 text-sm font-medium text-black dark:text-white"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white focus:border-primary focus-visible:outline-none"
                      placeholder="Shakib_Hossain"
                      defaultValue="Shakib_Hossain"
                    />
                  </div>

                  {/* BIO Field */}
                  <div className="mb-5.5">
                    <label
                      htmlFor="bio"
                      className="block mb-3 text-sm font-medium text-black dark:text-white"
                    >
                      BIO
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      rows="5"
                      className="w-full rounded border border-stroke bg-gray px-4.5 py-3 text-black dark:border-strokedark dark:bg-meta-4 dark:text-white focus:border-primary focus-visible:outline-none"
                      placeholder="Tell something about yourself..."
                      defaultValue="I am a web developer with a passion for design and coding."
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  >
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Profile Image Section */}
          <div className="col-span-1 xl:col-span-2">
            <div className="rounded-md border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
              {/* Section Title */}
              <div className="border-b border-stroke px-7 py-4 dark:border-strokedark">
                <h3 className="text-lg font-semibold text-black dark:text-white">
                  Your Photo
                </h3>
              </div>

              {/* Profile Image */}
              <div className="p-7">
                <div className="mb-4 flex justify-center">
                  <Image
                    src="/images/user/user-01.png"
                    alt="User Photo"
                    width={150}
                    height={150}
                    className="rounded-full"
                  />
                </div>

                <div className="text-center">
                  <span className="mb-2 block text-sm font-medium text-black dark:text-white">
                    Allowed JPG, GIF or PNG. Max size of 800K
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center justify-center rounded bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
                  >
                    Change Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
