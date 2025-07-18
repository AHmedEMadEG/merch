'use client';

import { signOut } from 'firebase/auth';
import { Heart, LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/firebase/firabase';
import { toast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/helpers';
import { User } from '@/types';

interface UserDropdownProps {
	user: User;
	wishlistCount?: number;
}

export function UserDropdown({ user, wishlistCount = 0 }: UserDropdownProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleSignOut = async () => {
		try {
			await signOut(auth);
		} catch (error) {
			console.error('Error signing out:', error);
			toast.error('Error', `Error signing out: ${error}`);
		}
	};

	return (
		<DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					className="flex items-center space-x-2 rounded-full border-gray-300 px-4 py-2 hover:border-purple-500"
				>
					<Avatar className="h-6 w-6">
						<AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
						<AvatarFallback className="bg-purple-100 text-purple-800">{getInitials(user)}</AvatarFallback>
					</Avatar>
					<span className="hidden md:inline">{user.displayName || user.email?.split('@')[0] || 'User'}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-72 border-none bg-white p-2">
				<div className="p-4">
					<div className="mb-2 text-lg font-semibold">Hi, {user.displayName || user.email?.split('@')[0] || 'User'}!</div>
					<div className="flex items-center gap-3">
						<Avatar className="h-10 w-10">
							<AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
							<AvatarFallback className="bg-purple-100 text-purple-800">{getInitials(user)}</AvatarFallback>
						</Avatar>
						<div className="text-sm text-gray-600">{user.email}</div>
					</div>
				</div>

				<DropdownMenuSeparator />

				<Link href="/wishlist" className="block">
					<DropdownMenuItem className="flex cursor-pointer items-center justify-between p-3 text-base hover:bg-purple-200">
						<div className="flex items-center">
							<Heart className="mr-3 h-5 w-5" />
							<span>My Wishlist</span>
						</div>
						{wishlistCount > 0 && <span className="font-medium text-purple-600">{wishlistCount}</span>}
					</DropdownMenuItem>
				</Link>

				<Link href="/account" className="block">
					<DropdownMenuItem className="flex cursor-pointer items-center p-3 text-base hover:bg-purple-200">
						<UserIcon className="mr-3 h-5 w-5" />
						<span>Account Settings</span>
					</DropdownMenuItem>
				</Link>

				<DropdownMenuSeparator />

				<DropdownMenuItem
					className="flex cursor-pointer items-center p-3 text-base text-red-600 hover:bg-red-200 hover:text-red-700"
					onClick={handleSignOut}
				>
					<LogOut className="mr-3 h-5 w-5" />
					<span>Sign Out</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
