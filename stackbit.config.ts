import { defineStackbitConfig, DocumentStringLikeFieldNonLocalized, SiteMapEntry } from '@stackbit/types';
import { GitContentSource } from '@stackbit/cms-git';
import { allModels } from 'sources/local/models';

const gitContentSource = new GitContentSource({
    rootPath: __dirname,
    contentDirs: ['content'],
    models: Object.values(allModels),
    assetsConfig: {
        referenceType: 'static',
        staticDir: 'public',
        uploadDir: 'images',
        publicPath: '/'
    }
});

export const config = defineStackbitConfig({
    stackbitVersion: '~0.6.0',
    ssgName: 'nextjs',
    nodeVersion: '18',
    styleObjectModelName: 'ThemeStyle',
    contentSources: [gitContentSource],
    presetSource: {
        type: 'files',
        presetDirs: ['sources/local/presets']
    },
    actions: [{
        type: 'model', 
        name: '_create_from_preset_ai', 
        actionId: 'config.actions._create_from_preset_ai.{uuid}', 
        locations: ['preset-card'],  
		hidden: false,
		preferredStyle: 'button-primary',
		inputFields: [
		    { 
		      type: 'strng',
		      name: 'contentUrl'
		    },
		    {
		      type: 'text',
		      name: 'customPrompt'
		    },
		    {
		      // the 'preset' field is hidden because it is added automatically
		      type: 'json',
		      name: 'preset',
		      hidden: true
		    }
		  ]
    }],
    siteMap: ({ documents, models }): SiteMapEntry[] => {
        const pageModels = models.filter((model) => model.type === 'page').map((model) => model.name);
        return documents
            .filter((document) => pageModels.includes(document.modelName))
            .map((document) => {
                let slug = (document.fields.slug as DocumentStringLikeFieldNonLocalized)?.value;
                if (!slug) return null;
                /* Remove the leading slash in order to generate correct urlPath
                regardless of whether the slug is '/', 'slug' or '/slug' */
                slug = slug.replace(/^\/+/, '');
                switch (document.modelName) {
                    case 'PostFeedLayout':
                        return {
                            urlPath: '/blog',
                            document: document
                        };
                    case 'PostLayout':
                        return {
                            urlPath: `/blog/${slug}`,
                            document: document
                        };
                    default:
                        return {
                            urlPath: `/${slug}`,
                            document: document
                        };
                }
            });
    }
});

export default config;
