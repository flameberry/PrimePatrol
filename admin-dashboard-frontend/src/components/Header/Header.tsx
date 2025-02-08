import DropdownNotification from "./DropDownNotification";
import DropdownMessage from "./DropDownMessage";
import DropdownUser from "./DropDownUser";
import { Typography } from "@mui/material";
import { usePathname } from "next/navigation";

const Header = () => {
    const pathname = usePathname();

    return (
        <header className="sticky top-0 z-999 flex w-full h-16 bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
            <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
                <div className="flex items-center gap-2 sm:gap-4 ">
                    <Typography variant="h6" noWrap component="div">
                        {pathname.replace(/^\/+/, "").charAt(0).toUpperCase() + pathname.replace(/^\/+/, "").slice(1)}
                    </Typography>
                </div>

                <div className="flex items-center gap-3 2xsm:gap-7">
                    <ul className="flex items-center gap-2 2xsm:gap-4">
                        <DropdownNotification />
                        <DropdownMessage />
                    </ul>

                    <DropdownUser />
                </div>
            </div>
        </header>
    );
};

export default Header;
