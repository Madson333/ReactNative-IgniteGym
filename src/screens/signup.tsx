import {VStack, Image, Text, Center, Heading, ScrollView, useToast} from "native-base"
import BackgroundImg from "@assets/background.png"
import LogoSvg from "@assets/logo.svg"
import { Input } from "@components/input"
import { Button } from "@components/button"
import { useNavigation } from "@react-navigation/native"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { api } from "@services/api"
import axios from "axios"
import { AppError } from "@utils/appError"
import { useState } from "react"
import { useAuth } from "@hooks/useAuth"

const schema = yup.object({
  name: yup.string().required("Nome é obrigatório"),
  email: yup.string().email().required("Email é obrigatório"),
  password: yup.string().required("Senha é obrigatória").min(6, "A senha deve ter no mínimo 8 caracteres"),
  password_confirm: yup.string().required("Confirmação de senha é obrigatória").oneOf([yup.ref('password'), ""], 'Senhas não conferem'),
})

type FormDataProps = {
  name: string;
  email: string;
  password: string;
  password_confirm: string;
}

export function SignUp(){
  const {singIn} = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const toast = useToast()
  const {control, handleSubmit, formState: {errors}} = useForm<FormDataProps>({
    resolver: yupResolver(schema)
  })
 
  const navigation = useNavigation()
  
  function handleGoBack(){
    navigation.goBack()
  }

 async function handleSignUp({name, email, password}: FormDataProps){
     try{
        setIsLoading(true)
        await api.post("/users", {name, email, password})
        await singIn(email, password)
     }catch(error){
        setIsLoading(false)
        const isAppError = error instanceof AppError;
        const title = isAppError ? error.message : "Não foi possivel criar sua conta. Por favor, tente mais tarde."
        toast.show({
            title,
            placement: "top",
            bgColor: "red.500"
        })
     
     }
  }

  return(
    <ScrollView contentContainerStyle={{flexGrow: 1}} showsVerticalScrollIndicator={false}>
       <Image 
          source={BackgroundImg}
          defaultSource={BackgroundImg}
          alt="Pessoas treinando"
          resizeMode="contain"
          position="absolute"
        />
     
      <VStack flex={1} px={10}>
      
        <Center my={24}> 
          <LogoSvg />
          <Text color={"gray.100"}  fontSize="sm">
            Treine sua mente e seu corpo
          </Text>
        </Center>

        <Center>
          <Heading  fontFamily={"heading"} color={"gray.100"} fontSize="xl" mb="6">
            Crie sua conta 
          </Heading>

          <Controller 
              control={control}
              name="name"
              render={({field: {onChange, value}}) => (
                <Input 
                  placeholder="Nome" 
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.name?.message}
                />
              )}
            />

         
          <Controller 
              control={control}
              name="email"
              render={({field: {onChange, value}}) => (
                <Input 
                  placeholder="E-mail" 
                  keyboardType="email-address" 
                  autoCapitalize="none" 
                  onChangeText={onChange}
                  value={value}
                  errorMessage={errors.email?.message}
                  />
               )}
            />

          <Controller 
            control={control}
            name="password"
            render={({field: {onChange, value}}) =>(
               <Input 
                  placeholder="Senha" 
                  secureTextEntry  
                  onChangeText={onChange} 
                  value={value} 
                  errorMessage={errors.password?.message}
                />
            )}
          />
          <Controller 
            control={control}
            name="password_confirm"
            render={({field: {onChange, value}}) =>(
               <Input 
                placeholder="Confirme a senha" 
                secureTextEntry  
                onChangeText={onChange} 
                value={value} 
                onSubmitEditing={handleSubmit(handleSignUp)}
                returnKeyType="send"
                errorMessage={errors.password_confirm?.message}
                />
            )}
          />

         
          
          <Button isLoading={isLoading} onPress={handleSubmit(handleSignUp)} title="Criar e acessar"/>
        </Center>

        <Button onPress={handleGoBack} mt={12} title="Voltar para o login" variant={"outline"} />
      </VStack>
    </ScrollView>
  )
}