import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNavigate } from "react-router-dom"
import { Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { WalletSelector } from "@/components/WalletSelector"
import { ChangeEvent, useState } from "react";
import { Separator } from "@/components/ui/separator"

const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  privateAddress: z.string().nonempty({
    message: "Private Address is required.",
  }),
})

const Signup = () => {
  const navigate = useNavigate();
  const [privateAddress, setPrivateAddress] = useState<string>('');
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      privateAddress: '',
    },
  });

  const handleSubmit = () => {
    setPrivateAddress('');
    navigate('/');
  }

  const handleAddressInput = ( e : ChangeEvent<HTMLInputElement>) =>{
    console.log(e.target.value);
    setPrivateAddress(e.target.value);
  }

  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="flex flex-row w-full h-full justify-center items-center">
        <div className=" gap-[20px] flex flex-col justify-center items-center">
          <div className="flex flex-col font-bold justify-center items-center">
            <div className="flex justify-center items-center gap-4 text-[36px]">Connect your wallet {< Wallet size={36} />}</div>
            <h3 className="text-[#9c9c9c] text-[14px] justify-center items-center">connet your wallet or enter your private key</h3>
          </div>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="privateAddress"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-[16px]">Private Key</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Private Key"
                        value={privateAddress}
                        onChange={handleAddressInput}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button onClick={handleSubmit} className="w-full">Submit</Button>
              <Separator />
              <div className="flex flex-col">
                <WalletSelector />
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default Signup