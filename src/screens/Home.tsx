import { ExerciseCard } from "@components/exerciseCard";
import { Group } from "@components/group";
import { HomeHeader } from "@components/homeHeader";
import { Loading } from "@components/loading";
import { ExerciseDTO } from "@dtos/exerciseDTO";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AppNavigatorRoutesProps } from "@routes/app.routes";
import { api } from "@services/api";
import { AppError } from "@utils/appError";
import { FlatList, Heading, HStack, Text, useToast, VStack } from "native-base";
import { useCallback, useEffect, useState } from "react";

export function  Home(){
  const [isLoading, setIsLoading] = useState(true)
  const [groups, setGroups] = useState<string[]>([])
  const [exercises, setExercises] = useState<ExerciseDTO[]>([])
  const [groupSelected, setGroupSelected] = useState("antebraço")
  const toast = useToast()
  
  const navigation = useNavigation<AppNavigatorRoutesProps>()

  function handleOpenExerciseDetails(exerciseId: string){
    navigation.navigate("exercise",{exerciseId} )
  }

  async function fetchGroups(){
    try {
      const response = await api.get("/groups")
      setGroups(response.data)
    } catch(error){
      const isAppError = error instanceof AppError
      const title = isAppError? error.message : "Não foi possivel carregar os grupos."
      toast.show({
        title,
        placement: "top",
        bgColor: "red.500"
      })
    }
  }

  async function fetchExercisesByGroup(){
    try{
      setIsLoading(true)
      const response = await api.get(`/exercises/bygroup/${groupSelected}`);
      setExercises(response.data)
    }catch(error){
      const isAppError = error instanceof AppError
      const title = isAppError? error.message : "Não foi possivel carregar os exercicios."
      toast.show({
        title,
        placement: "top",
        bgColor: "red.500"
      })
    } finally{
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  useFocusEffect(useCallback(() => {
    fetchExercisesByGroup()
  }, [groupSelected]))

  return (
    <VStack flex={1}>
      <HomeHeader />
      <FlatList 
        data={groups}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false} 
        _contentContainerStyle={{ px: 8 }}
        my={10}
        maxH={10}
        minH={10}
        renderItem={({item}) => (
          <Group 
          name={item}
          isActive={groupSelected === item} 
          onPress={() => setGroupSelected(item)}
          />
        )}
      />

      {isLoading ? (
          <Loading />
      ):(
          <VStack flex={1} px={8}>
          <HStack justifyContent="space-between" mb={5}>
            <Heading  fontFamily={"heading"} color="gray.200" fontSize="md">
              Exercícios
            </Heading>
            <Text color="gray.200" fontSize="sm">
              {exercises.length}
            </Text>
          </HStack>

          <FlatList 
            data={exercises}
            showsVerticalScrollIndicator={false}
            _contentContainerStyle={{
              paddingBottom: 20
            }}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
              <ExerciseCard onPress={() => handleOpenExerciseDetails(item.id)} data={item} />
            )}
          />

        </VStack>
      )}
      
    </VStack>
  )
}