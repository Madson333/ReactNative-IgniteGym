import { HistoryCard } from "@components/historyCard";
import { ScreenHeader } from "@components/screenHeader";
import { HistoryByDayDTO } from "@dtos/HistoryByDayDTO";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "@services/api";
import { AppError } from "@utils/appError";
import { VStack, SectionList, Heading, Text, useToast } from "native-base";
import { useCallback, useState } from "react";
import { Loading } from "@components/loading";


export function  History(){
 const [isLoading, setIsLoading] = useState(true)
  const [exercises, setExercises] = useState<HistoryByDayDTO[]>([]);
  const toast = useToast()


  async function fetchHistory(){
    try{
      setIsLoading(true)
      const response = await api.get("/history")
      setExercises(response.data)
    } catch (error) {
      const isAppError = error instanceof AppError
      const title = isAppError? error.message : "Não foi possivel carregar o histórico."
      toast.show({
        title,
        placement: "top",
        bgColor: "red.500"
      })
    }finally{
      setIsLoading(false)
    }
  }

  useFocusEffect(useCallback(() => {
    fetchHistory()
  },[]))
  
  return (
    <VStack flex={1}>
     <ScreenHeader title="Histórico de exercicios" />

    {isLoading ? <Loading /> : (
        <SectionList 
        sections={exercises}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <HistoryCard data={item} />
        )}
        renderSectionHeader={({ section }) => (
          <Heading  fontFamily={"heading"} color="gray.200" fontSize="md" mt={10} mb={3}>
            {section.title}
          </Heading>
        )}
        px={8}
        contentContainerStyle={exercises.length === 0 && {flex: 1, justifyContent: "center"}}
        ListEmptyComponent={() => (
          <Text color={"gray.200"} textAlign={"center"}>
            Não há exercicios registrados ainda.
          </Text>
        )}
        showsVerticalScrollIndicator={false}
      />
    )}

    </VStack>
  )
}