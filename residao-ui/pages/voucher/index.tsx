"use client"
import { useState, FormEvent, useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
    InputOTPSeparator,
} from "@/components/ui/input-otp"
import { toast } from "@/components/ui/use-toast"
import { useAccount } from "wagmi";
import { FiArrowLeft } from 'react-icons/fi';
import { Layer } from '@/components/RoundedDrawerNav';
import Ripple from '@/components/magicui/ripple';
import Link from 'next/link';

const FormSchema = z.object({
    pin: z.string().min(6, {
        message: "Your voucher must be 8 characters.",
    }),
})

const VoucherPage: React.FC = () => {
    const [userAddress, setUserAddress] = useState<`0x${string}` | null>(null);
    const [isMounted, setIsMounted] = useState(false);
    const { address, isConnected } = useAccount();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (isConnected && address) {
            setUserAddress(address);
        }
    }, [address, isConnected]);

    return (
        <Layer>
            <div className="relative flex h-full w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-3xl border bg-background p-20 md:shadow-xl">
                <p className="z-10 whitespace-pre-wrap text-center text-5xl font-medium tracking-tighter text-white">
                    Voucher
                </p>
                <Ripple />
            </div>
            <div className="flex pb-5 flex-col justify-center items-center relative">
                {/* <FiArrowLeft className="absolute text-2xl top-4 left-4 cursor-pointer" onClick={() => window.history.back()} /> */}
                {isConnected && (<InputOTPForm address={userAddress ?? ''} />)}
            </div>
        </Layer>

    );
};

export default VoucherPage;


export function InputOTPForm({ address }: { address: string }) {
    const [token, setToken] = useState<string>('');
    const [transactionHash, setTransactionHash] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            pin: "",
        },
    })

    async function onSubmit(data: z.infer<typeof FormSchema>): Promise<void> {
        console.log(data.pin)
        try {
            const res = await fetch('https://residao-voucher.vercel.app/api/getVoucher/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ toAddress: address, token: data.pin })
            });

            const tx = await res.json();

            if (res.ok) {
                setTransactionHash(tx.transactionHash);
                toast({
                    title: "Your transaction was successful!",
                    description: (
                        <p>transactionHash</p>
                    ),
                })
                setError(null);
            } else {
                setTransactionHash(null);
                setError(tx.message || 'Error occurred');
            }
        } catch (error) {
            setTransactionHash(null);
            setError('Error occurred while sending the request');
        }
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col w-9/12 items-center justify-center space-y-6">
                    <FormField
                        control={form.control}
                        name="pin"
                        render={({ field }) => (
                            <FormItem>
                                {/* <FormLabel>Voucher number</FormLabel> */}
                                <FormControl>
                                    <InputOTP maxLength={8} {...field}>
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                            <InputOTPSlot index={3} />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                            <InputOTPSlot index={6} />
                                            <InputOTPSlot index={7} />
                                        </InputOTPGroup>
                                    </InputOTP>
                                </FormControl>
                                <FormDescription>
                                    Load a voucher to add to your balance {address}.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        className='w-full h-12 rounded-2xl text-xs font-bold'
                        variant={"secondary"}
                        type="submit">
                        LOAD VOUCHER
                    </Button>
                </form>
            </Form>
            {transactionHash && (
                <Link href={transactionHash}>
                    View transaction
                </Link>
            )}
            {error && (
                <div>
                    <h2>Error</h2>
                    <p>{error}</p>
                </div>
            )}
        </>

    )
}