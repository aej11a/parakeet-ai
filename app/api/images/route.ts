import { searchImages } from "@/bing/image-search";
import { NextRequest, NextResponse } from "next/server";

import {
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
  ResponseTypes,
} from "openai-edge";

export const runtime = "edge";

// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(config);

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("q");
  if (!searchTerm) {
    return new Response("Missing searchTerm", { status: 400 });
  }

  const result = await searchImages(searchTerm);
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
  return new NextResponse(JSON.stringify(images), {
    headers: {
      "content-type": "application/json",
    },
  });
};

export const POST = async (request: NextRequest) => {
  const { recent_messages } = await request.json();
  if (!recent_messages || !recent_messages.length) {
    return new Response("Missing recent messages", { status: 400 });
  }

  const search_term_response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: `Return only a single search term to find images related to this message. Do not include any punctuation, as this will break the rules of the system.
        "${recent_messages[1].content}"`,
      },
    ],
  });

  const search_term_data =
    (await search_term_response.json()) as ResponseTypes["createChatCompletion"];

  console.log(recent_messages, search_term_data.choices[0].message!.content);

  const result = await searchImages(
    search_term_data.choices[0].message!.content
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
  return new NextResponse(JSON.stringify(images), {
    headers: {
      "content-type": "application/json",
    },
  });
};
