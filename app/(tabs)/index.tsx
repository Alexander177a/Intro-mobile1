import { Link } from "expo-router";
import React, {  ReactNode } from "react";
import {  Text, View, ViewStyle,ImageBackground,StyleSheet, ScrollView } from "react-native";

const Index = () => {
  return (

    <>
    <ScrollView >

      <View style={{height: 100,backgroundColor:"skyblue", justifyContent:"center", alignItems:"center"}}>
        <Text>Welcome to PLAY PADEL</Text>
      </View>



      <BodyView style={{backgroundColor:"steelblue", height:700}}>
        <View id="Menu interface" 
              style={{ 
              justifyContent:"space-around", 
              alignItems:"center",
              flex:1,
            }}> 
            <Link href='./features/lane'> 
              <ImageBackground 
                source={require('../../assets/images/location.png')}
                style={style.icoonImageStyle}
                imageStyle={style.imageStyle}
              >
              <Text >BOOK A LANE </Text>
              </ImageBackground>     
            </Link>
            
            <Link href='./features/course'><ImageBackground 
                source={require('../../assets/images/education.jpg')}
                style={style.icoonImageStyle}
                imageStyle={style.imageStyle}
              >
              <Text >COURSE </Text>
              </ImageBackground>  
              </Link>


            <Link href='./features/competition/'><ImageBackground 
                source={require('../../assets/images/competition.png')}
                style={style.icoonImageStyle}
                imageStyle={style.imageStyle}
              >
              <Text >COMPETITION </Text>
              </ImageBackground> </Link>


            <Link href="./features/match">
            <ImageBackground 
                source={require('../../assets/images/match.webp')}
                style={style.icoonImageStyle}
                imageStyle={style.imageStyle}
              >
              <Text >MATCH </Text>
              </ImageBackground> </Link>

        </View>
      </BodyView>



    </ScrollView>
    </>


  );
}

type HeaderViewProps ={
  color:string,
  children? :ReactNode
  flex:number
  style?:ViewStyle
}
const HeaderView = ({color,children, flex}: HeaderViewProps) => {
  return(
    <View style={{backgroundColor:color
      ,flex:flex
    }}>
      {children}
    </View>
)}


type BodyViewProps ={
  children?:ReactNode,
  style?:ViewStyle
}

const BodyView =({children, style}:BodyViewProps)=>{
  return(
    <View style={style}>
      {children}
    </View>
  )
}

const style = StyleSheet.create({
  icoonImageStyle:{
    height:100, 
    width:300, 
    justifyContent: "center",
    alignItems:"center",
    backgroundColor:"white",
    borderRadius:10,
    resizeMode:"contain"
  },
  imageStyle:{
    resizeMode:"contain"
  },
  title: {
    justifyContent:"center",
    alignContent:"center",
  } 
});



export default Index;

