import { url } from "inspector";
import { MetadataRoute } from "next";

export default function sitemap(): Promise<MetadataRoute.Sitemap> {
 
    return Promise.resolve([
        {
            url: `${process.env.PUBLIC_BASE_URL}`,
            lastModified: new Date(),
        },
        {
            url: `${process.env.PUBLIC_BASE_URL}/en`,
            lastModified: new Date(),
        },
        {
            url: `${process.env.PUBLIC_BASE_URL}/es`,
            lastModified: new Date(),
        },
        {
            url: `${process.env.PUBLIC_BASE_URL}/login`,
            lastModified: new Date(),
        },
        {
            url: `${process.env.PUBLIC_BASE_URL}/sign-up`,
            lastModified: new Date(),
        },
    ]);
}