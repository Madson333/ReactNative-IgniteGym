import { Button } from "@components/button";
import { Input } from "@components/input";
import { ScreenHeader } from "@components/screenHeader";
import { UserPhoto } from "@components/userPhoto";
import { Center, ScrollView, VStack, Skeleton, Text, Heading, useToast } from "native-base";
import { useState } from "react";
import { TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker"
import {Controller, useForm} from "react-hook-form"
import { useAuth } from "@hooks/useAuth";
import { api } from "@services/api";
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup";
import { AppError } from "@utils/appError";
import defaultUserPhotoImg from "@assets/userPhotoDefault.png"


const PHOTO_SIZE = 33


const profileSchema = yup.object({
  name: yup
    .string()
    .required('Informe o nome'),
  password: yup
    .string()
    .min(6, 'A senha deve ter pelo menos 6 dígitos.')
    .nullable()
    .transform((value) => !!value ? value : null),
  confirm_password: yup
    .string()
    .nullable()
    .transform((value) => !!value ? value : null)
    .oneOf([yup.ref('password'), null], 'A confirmação de senha não confere.')
    .when("password", {
      is: (Field: any) => Field,
      then: (schema) => schema.nullable().required('Informe a confirmação da senha').transform((value) => !!value ? value : null)
    }),
}).shape({
  email: yup.string().nonNullable().required(),
  old_password: yup.string().nullable(),
});


type FormDataProps = yup.InferType<typeof profileSchema>

export function  Profile(){
  const [isUpdating, setIsUpdating] = useState(false)
  const [photoIsLoading, setPhotoIsLoading] = useState(false)
  const { user, updateUserProfile } = useAuth()
  const  toast = useToast()
  const {control, handleSubmit, formState: {errors}} = useForm<FormDataProps>({
    defaultValues: {
      name: user.name,
      email: user.email,
    },
    resolver: yupResolver(profileSchema)
  })

  async function handleUserPhotoSelect(){
    setPhotoIsLoading(true)
    try{
      const photoSelected = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        aspect: [4, 4],
        allowsEditing: true,
      }) 
  
      if(photoSelected.canceled){ return }

      const fileExtension = photoSelected.assets[0].uri.split('.').pop()
    
      const photoFile = {
        name: `${user.name}.${fileExtension}`.toLowerCase(),
        uri: photoSelected.assets[0].uri,
        type: `${photoSelected.assets[0].type}/${fileExtension}`
      } as any
      
      const userPhotoUploadForm = new FormData()
      userPhotoUploadForm.append("avatar", photoFile)

     const avatarUpdatedResponse = await api.patch('/users/avatar', userPhotoUploadForm, {
        headers: {
          "Content-Type": "multiart/form-data"
        }
      })

      const userUpdated = user
      userUpdated.avatar = avatarUpdatedResponse.data.avatar
      updateUserProfile(userUpdated)

      toast.show({
        title: "Foto atualizada!",
        placement: "top",
        bgColor: "green.500"
      })
      
    } catch(error){
      console.log(error)
    } finally {
      setPhotoIsLoading(false)
    }
  }

  async function handleProfileUpdate(data: FormDataProps){
    try{
      setIsUpdating(true)
      const userUpdated = user
      userUpdated.name = data.name
      const response = await api.put("/users", data)
      await updateUserProfile(userUpdated)
      toast.show({
        title: "Perfil atualizado com sucesso",
        placement: "top",
        bgColor: "green.500"
      })
      
    } catch(error){
      const isAppError = error instanceof AppError
      const title = isAppError? error.message : "Não foi possivel atualizar o perfil."
      toast.show({
        title,
        placement: "top",
        bgColor: "red.500"
      })
    }finally {
      setIsUpdating(false)
    }
  }
  
  return (
    <VStack flex={1}>
      <ScreenHeader title="Perfil" />
      <ScrollView contentContainerStyle={{paddingBottom: 56}}>
        <Center mt={6} px={10} >
         { photoIsLoading ?
          <Skeleton 
            height={PHOTO_SIZE} 
            width={PHOTO_SIZE} 
            rounded={"full"} 
            startColor="gray.500"
            endColor="gray.400"
            />
        :
          <UserPhoto 
          source={
            user.avatar 
            ? {uri: `${api.defaults.baseURL}/avatar/${user.avatar}`} 
            : defaultUserPhotoImg }
            alt="Foto do Perfil"
            size={PHOTO_SIZE}
          />}
          <TouchableOpacity onPress={handleUserPhotoSelect} >
            <Text color={"green.500"} fontWeight={"bold"} fontSize={"md"} mt={2} mb={8}>
              Alterar foto
            </Text>
          </TouchableOpacity>

        <Controller 
          control={control}
          name="name"
          render={({field: {value, onChange}}) => (
            <Input  
              placeholder="Nome"
              bg={"gray.600"}
              onChangeText={onChange}
              value={value}
              errorMessage={errors.name?.message}
             />
          )}
        />

        <Controller 
          control={control}
          name="email"
          render={({field: {value, onChange}}) => (
            <Input  
              placeholder="E-mail"
              isDisabled
              bg={"gray.600"}
              onChangeText={onChange}
              value={value}
             />
          )}
        />

        </Center>

        <VStack px={10} mt={12} mb={9}>
          <Heading  fontFamily={"heading"} color={"gray.200"} fontSize={"md"} mb={2}>Alterar senha</Heading>
          
          <Controller 
          control={control}
          name="old_password"
          render={({field: { onChange}}) => (
            <Input 
            placeholder="Senha antiga"
            bg={"gray.600"} 
            secureTextEntry
            onChangeText={onChange}
          />
          )}
        />

        <Controller 
          control={control}
          name="password"
          render={({field: {onChange}}) => (
            <Input 
            placeholder="Nova senha"
            bg={"gray.600"} 
            secureTextEntry
            onChangeText={onChange}
            errorMessage={errors.password?.message}
          />
          )}
        />

        <Controller 
          control={control}
          name="confirm_password"
          render={({field: {onChange}}) => (
            <Input 
            placeholder="Confirme a nova senha"
            bg={"gray.600"} 
            secureTextEntry
            onChangeText={onChange}
            errorMessage={errors.confirm_password?.message}
          />
          )}
        />
          <Button 
            onPress={handleSubmit(handleProfileUpdate)}
            title="Atualizar" 
            mt={4}
            isLoading={isUpdating}
          />
        </VStack>
      </ScrollView>
    </VStack>
  )
}