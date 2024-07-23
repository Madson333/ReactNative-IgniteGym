import {createBottomTabNavigator, BottomTabNavigationProp} from "@react-navigation/bottom-tabs"
import { Exercise } from "@screens/Exercise";
import { History } from "@screens/History";
import { Home } from "@screens/Home";
import { Profile } from "@screens/Profile";

import HomeSvg from "@assets/home.svg"
import HistorySvg from "@assets/history.svg"
import ProfileSvg from "@assets/profile.svg"
import { useTheme } from "native-base";
import { Platform } from "react-native";

type AppRoutesProps = {
  home: undefined;
  history: undefined;
  profile: undefined;
  exercise: {exerciseId: string};
}

export type AppNavigatorRoutesProps =  BottomTabNavigationProp<AppRoutesProps>

const {Navigator, Screen} = createBottomTabNavigator<AppRoutesProps>()

export function AppRoutes(){
  const { sizes, colors } = useTheme()
  const iconSize = sizes[6]
  const iconColor = colors.green[500]
  const iconInativeColor = colors.gray[200]
  const BgBarColor = colors.gray[600]
  
  return (
    <Navigator screenOptions={{
      headerShown: false, 
      tabBarShowLabel: false,
      tabBarActiveTintColor: iconColor,
      tabBarInactiveTintColor: iconInativeColor,
      tabBarStyle: {
        backgroundColor: BgBarColor,
        borderTopWidth: 0,
        height: Platform.OS === "android" ? "auto" : 96,
        paddingBottom: sizes[10],
        paddingTop: sizes[6],
      }
      }}>
      <Screen 
        name="home" 
        component={Home} 
        options={{
          tabBarIcon: ({color}) => (
            <HomeSvg
              fill={color}
              width={iconSize}
              height={iconSize}
            />
          )
        }}
      />
      <Screen 
        name="history" 
        component={History} 
        options={{
          tabBarIcon: ({color}) => (
            <HistorySvg
              fill={color}
              width={iconSize}
              height={iconSize}
            />
          )
        }}
      />
      <Screen 
        name="profile" 
        component={Profile} 
        options={{
          tabBarIcon: ({color}) => (
            <ProfileSvg
              fill={color}
              width={iconSize}
              height={iconSize}
            />
          )
        }}
      />
      <Screen 
        name="exercise" 
        component={Exercise} 
        options={{
          tabBarButton: () => null
        }}
        />
    </Navigator>
  )
}