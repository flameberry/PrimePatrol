import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import NotificationAdd from '@mui/icons-material/NotificationAdd';

const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  const trigger = useRef<any>(null);
  const dropdown = useRef<any>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdown.current) return;
      if (
        !dropdownOpen ||
        dropdown.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Close if the escape key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <li className="relative">
      <Link
        ref={trigger}
        onClick={() => {
          setNotifying(false);
          setDropdownOpen(!dropdownOpen);
        }}
        href="#"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-stroke bg-gray hover:bg-gray-100 hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
      >
        {/* Notification Icon */}
        <NotificationAdd style={{ color: 'gray', width: 20, height: 20 }} />

        {/* Red dot notification indicator */}
        {notifying && (
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-600 rounded-full border-2 border-white dark:border-meta-4"></span>
        )}
      </Link>

      {/* Dropdown Menu */}
      <div
        ref={dropdown}
        onFocus={() => setDropdownOpen(true)}
        onBlur={() => setDropdownOpen(false)}
        className={`absolute right-0 mt-2 w-80 rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark ${
          dropdownOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="px-5 py-3 border-b border-stroke dark:border-strokedark">
          <h5 className="text-base font-semibold text-bodydark2 text-black">Notifications</h5>
        </div>

        <ul className="max-h-64 overflow-y-auto">
          {[
            {
              message: 'Edit your information in a swipe',
              date: '12 May, 2025',
              description:
                'Sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim.',
            },
            {
              message: 'It is a long established fact',
              date: '24 Feb, 2025',
              description: 'That a reader will be distracted by the readable content.',
            },
            {
              message: 'Many variations of passages',
              date: '04 Jan, 2025',
              description:
                'There are many variations of passages of Lorem Ipsum available, but the majority have suffered.',
            },
            {
              message: 'Variations of Lorem Ipsum',
              date: '01 Dec, 2024',
              description: 'But the majority have suffered alteration in some form.',
            },
          ].map((item, index) => (
            <li key={index}>
              <Link
                className="flex flex-col gap-2 px-5 py-4 border-b border-stroke hover:bg-gray-50 dark:border-strokedark dark:hover:bg-meta-4"
                href="#"
              >
                <p className="text-sm font-medium text-black dark:text-white">{item.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{item.date}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
};

export default DropdownNotification;
