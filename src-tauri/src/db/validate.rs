use super::LinkInput;
use url::Url;

const MAX_TITLE_LEN: usize = 500;
const MAX_URL_LEN: usize = 2048;
const MAX_FAVICON_LEN: usize = 2048;
const MAX_SOURCE_LEN: usize = 200;
const MAX_TAG_LEN: usize = 100;
const MAX_TAGS: usize = 50;

pub fn validate_link_input(input: &LinkInput) -> Result<(), String> {
    let title = input.title.trim();
    if title.is_empty() {
        return Err("title is required".into());
    }
    if title.len() > MAX_TITLE_LEN {
        return Err(format!("title must be at most {MAX_TITLE_LEN} characters"));
    }

    let url_str = input.url.trim();
    if url_str.is_empty() {
        return Err("url is required".into());
    }
    if url_str.len() > MAX_URL_LEN {
        return Err(format!("url must be at most {MAX_URL_LEN} characters"));
    }
    let parsed = Url::parse(url_str).map_err(|_| "url must be a valid absolute URL".to_string())?;
    match parsed.scheme() {
        "http" | "https" => {}
        _ => return Err("url must use http or https".into()),
    }

    if let Some(ref favicon) = input.favicon {
        let favicon = favicon.trim();
        if favicon.len() > MAX_FAVICON_LEN {
            return Err(format!("favicon must be at most {MAX_FAVICON_LEN} characters"));
        }
    }

    if let Some(ref source) = input.source {
        let source = source.trim();
        if source.len() > MAX_SOURCE_LEN {
            return Err(format!("source must be at most {MAX_SOURCE_LEN} characters"));
        }
    }

    if let Some(ref tags) = input.tags {
        if tags.len() > MAX_TAGS {
            return Err(format!("at most {MAX_TAGS} tags allowed"));
        }
        for tag in tags {
            let tag = tag.trim();
            if tag.is_empty() {
                return Err("tags cannot contain empty values".into());
            }
            if tag.len() > MAX_TAG_LEN {
                return Err(format!("each tag must be at most {MAX_TAG_LEN} characters"));
            }
        }
    }

    Ok(())
}

pub fn normalize_link_input(mut input: LinkInput) -> LinkInput {
    input.title = input.title.trim().to_string();
    input.url = input.url.trim().to_string();
    input.favicon = input
        .favicon
        .take()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());
    input.source = input
        .source
        .take()
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());
    if let Some(tags) = input.tags.take() {
        let tags: Vec<String> = tags
            .into_iter()
            .map(|t| t.trim().to_string())
            .filter(|t| !t.is_empty())
            .collect();
        input.tags = if tags.is_empty() { None } else { Some(tags) };
    }
    input
}
