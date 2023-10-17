import { Client as PSClient, Config as PSConfig } from "@planetscale/database";
import { auth } from "@clerk/nextjs";
// import {
//   Configuration,
//   OpenAIApi,
//   ChatCompletionRequestMessage as ChatMessage,
//   ChatCompletionRequestMessageRoleEnum as Roles,
//   ChatCompletionRequestMessageRoleEnum,
//   ResponseTypes,
// } from "openai-edge";
import OpenAI from "openai";

import { OpenAIStream, StreamingTextResponse } from "ai";

import {
  Client as GoogleMapsClient,
  GeocodeRequest,
} from "@googlemaps/google-maps-services-js";

async function getLatLngForPlaces(
  places: string[],
  city: string
): Promise<{ [key: string]: { lat: number; lng: number } }> {
  const client = new GoogleMapsClient({});
  const placeCoordinates: { [key: string]: { lat: number; lng: number } } = {};

  for (let place of places) {
    const geocodeRequest: GeocodeRequest = {
      params: {
        address: `${place}, ${city}`,
        key: process.env.NEXT_PUBLIC_GOOGLE_API_KEY as string,
      },
      // Uncomment and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual key
      // key: 'YOUR_GOOGLE_MAPS_API_KEY',
    };

    const response = await client.geocode(geocodeRequest);

    if (response.data.results && response.data.results[0]) {
      placeCoordinates[place] = response.data.results[0].geometry.location;
    }
  }
  return placeCoordinates;
}

import { NextRequest, NextResponse } from "next/server";
import { getChat } from "@/db/getChat";
import { DIAGRAM_SCHEMA } from "./schemas";
import { searchImages } from "@/experimental/bing/image-search";
// import { ChatCompletionFunctions } from "openai-edge/types/api";

const db_config: PSConfig = {
  host: process.env.PS_HOST,
  username: process.env.PS_USERNAME,
  password: process.env.PS_PASSWORD,
};

const db = new PSClient(db_config);

// const googleMapsClient = new GoogleMapsClient({});
// googleMapsClient.textSearch({
//   params: {
//     key: process.env.GOOGLE_MAPS_API_KEY as string,
//     query: "123 Main St",
//   },
//   timeout: 1000, // milliseconds
// });
const functions = [
  {
    name: "search_images",
    description:
      "Search for images to add context to the conversation, with an emphasis on educational content.",
    parameters: {
      type: "object",
      properties: {
        search_term: {
          type: "string",
          description: `The search-term to use when searching the internet for images.`,
        },
      },
      required: ["search_term"],
    },
  },
  {
    name: "search_wolfram_alpha",
    description: "Compute data-driven query answers and knowledge",
    parameters: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: `The question that will be used to search Wolfram Alpha.`,
        },
      },
      required: ["question"],
    },
  },
  // {
  //   name: "google_places_api_text_search",
  //   description: "Query-based search for places to display to a user in a map",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       query: {
  //         type: "string",
  //         description: `The query that will be used to search Google's Places API.`,
  //       },
  //     },
  //     required: ["query"],
  //   },
  // },
  {
    name: "google_places_api_find_place",
    description:
      "Search the google places API by the names of specific places to get additional info about each place",
    parameters: {
      type: "object",
      properties: {
        place_names: {
          type: "array",
          // Basically we're using function calling to extract specific place names from
          // the messages and isolate them for searching Google's Places API.
          description:
            "The place names that will be used to search Google's Places API.",
          items: {
            type: "string",
          },
        },
        city: {
          type: "string",
          description: "The city that the places are located in.",
        },
      },
      required: ["place_names"],
    },
  },
  {
    name: "generate_diagram",
    description:
      "Use flowchart.js to display a box diagram or flowchart to the user, useful for explanatory content or illustrating steps in a processes. Show conditions, branches, and loops, as needed.",
    parameters: DIAGRAM_SCHEMA,
  },
];

// const openAI = new OpenAI();

// IMPORTANT! Set the runtime to edge
export const runtime = "edge";
// export const unstable_allowDynamic = [
//   // This is currently required because `qs` uses `side-channel` which depends on this.
//   "/node_modules/function-bind/**",
// ];

export async function POST(req: NextRequest) {
  const req_body = await req.json();
  const userId = auth().userId;
  if (!userId) {
    return new Response("Not Authorized", { status: 401 });
  }
  if (!req_body.chatId) {
    return new Response("Missing chatId", { status: 400 });
  }
  // const chat = await getChat(req_body.chatId, userId);
  // if (!chat) {
  //   return new Response("Chat not found", { status: 404 });
  // }

  try {
    const functions_response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo-0613",
          messages: [
            {
              role: "user",
              content: req_body.user_message,
            },
            { role: "assistant", content: req_body.assistant_message },
          ],
          functions,
          temperature: 0.4,
        }),
      }
    ).then((res) => res.json());

    if (functions_response.choices[0].finish_reason === "function_call") {
      console.log(
        "chosen call:",
        functions_response.choices[0].message.function_call.name
      );
      if (
        functions_response.choices[0].message.function_call.name ===
        "google_places_api_find_place"
      ) {
        const placesToLookup: {
          place_names: string[];
          city: string;
        } = JSON.parse(
          functions_response.choices[0].message.function_call.arguments
        );

        const placeCoordinates = await getLatLngForPlaces(
          placesToLookup.place_names,
          placesToLookup.city
        );

        const result = {};

        result.contextType = "google_places_api_find_place";
        result.places = placeCoordinates;

        return NextResponse.json(result);
      } else if (
        functions_response.choices[0].message.function_call.name ===
        "generate_diagram"
      ) {
        console.log(
          functions_response.choices[0].message.function_call.arguments
        );
        const result = {};
        result.contextType = "generate_diagram";
        result.diagram = JSON.parse(
          functions_response.choices[0].message.function_call.arguments
        ).flowchartjsData;
        return NextResponse.json(result);
      } else if (
        functions_response.choices[0].message.function_call.name ===
        "search_images"
      ) {
        const result = await searchImages(
          JSON.parse(
            functions_response.choices[0].message.function_call.arguments
          ).search_term
        );
      
        if (!result || !result.value.length) {
          return new Response("No result", { status: 404 });
        }
        const images = result.value.map((image) => ({
          name: image.name,
          id: image.imageId,
          srcPageUrl: image.hostPageUrl,
          srcUrl: image.contentUrl,
          accentColor: image.accentColor,
          thumbnailUrl: image.thumbnailUrl,
          srcDimensions: {
            width: image.width,
            height: image.height,
          },
          thumbnailDimensions: {
            width: image.thumbnail.width,
            height: image.thumbnail.height,
          },
        }));
        return NextResponse.json({contextType: "search_images", images});
      }
    }

    // console.log("functioncall", response.choices);
  } catch (e) {
    console.log(e);
  }
  console.log("OKAT");
  return new Response("ok", {
    status: 200,
  });
}
