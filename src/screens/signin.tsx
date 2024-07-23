import {VStack, Image, Text, Center, Heading, ScrollView, useToast} from "native-base"
import BackgroundImg from "@assets/background.png"
import LogoSvg from "@assets/logo.svg"
import { Input } from "@components/input"
import { Button } from "@components/button"
import { useNavigation } from "@react-navigation/native"
import { AuthNavigatorRoutesProps } from "@routes/auth.routes"
import { useAuth } from "@hooks/useAuth"
import { Controller, useForm } from "react-hook-form"
import { AppError } from "@utils/appError"
import { useState } from "react"



type FormData = {
  email: string;
  password: string;
}

export function SignIn(){
  const [isLoading, setIsLoading] = useState(false)
  const { singIn, user } = useAuth()
  const toast = useToast()
  const navigation = useNavigation<AuthNavigatorRoutesProps>()

  function handleNewAccount(){
    navigation.navigate("signUp")
  }

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>()

  async function handleSignIn({ email, password }: FormData){
   try{
    setIsLoading(true)
    await singIn(email, password);
   }catch(error){
    const isAppError = error instanceof AppError

    const title =  isAppError ? error.message : "Não foi possivel entrar. Tente mais tarde."
    setIsLoading(false)
    toast.show({
      title,
      placement: "top",
      bgColor: "red.500"
    })
    
   }
  }

  return(
   <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
      <Image 
          source={BackgroundImg}
          defaultSource={BackgroundImg}
          alt="Pessoas treinando"
          resizeMode="contain"
          position="absolute"
        />
      <VStack flex={1} px={10} pb={16}>
        <Center my={24}> 
          <LogoSvg />
          <Text color={"gray.100"}  fontSize="sm">
            Treine sua mente e seu corpo
          </Text>
        </Center>

        <Center>
          <Heading  fontFamily={"heading"} color={"gray.100"} fontSize="xl" mb="6">
            Acesse sua conta 
          </Heading>

          <Controller 
            control={control}
            name="email"
            rules={{ required: 'Informe o e-mail' }}
            render={({ field: { onChange } }) => (
              <Input 
                placeholder="E-mail" 
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={onChange}
                errorMessage={errors.email?.message}
              />
            )}
          />
          
          <Controller 
            control={control}
            name="password"
            rules={{ required: 'Informe a senha' }}
            render={({ field: { onChange } }) => (
              <Input 
                placeholder="Senha" 
                secureTextEntry
                onChangeText={onChange}
                errorMessage={errors.password?.message}
              />
            )}
          />
          <Button isLoading={isLoading} title="Acessar" onPress={handleSubmit(handleSignIn)} />
        </Center>

        <Center mt={24}>
            <Text color={"gray.100"} fontSize={"sm"} mb={3} fontFamily={"body"}>
              Ainda não tem acesso?
            </Text>         
        </Center>

        <Button onPress={handleNewAccount} title="Criar conta" variant={"outline"} />
      </VStack>
    </ScrollView>
  )
}