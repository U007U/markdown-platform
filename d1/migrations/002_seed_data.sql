-- Insert default roles
INSERT INTO
    users (
        id,
        email,
        username,
        display_name,
        role,
        password,
        email_verified,
        created_at
    )
VALUES (
        'role-guest',
        'guest@markdown.platform',
        'guest',
        'Guest',
        'guest',
        'none',
        0,
        datetime('now')
    ),
    (
        'role-user',
        'user@markdown.platform',
        'user',
        'User',
        'user',
        'none',
        0,
        datetime('now')
    ),
    (
        'role-author',
        'author@markdown.platform',
        'author',
        'Author',
        'author',
        'none',
        0,
        datetime('now')
    ),
    (
        'role-moderator',
        'moderator@markdown.platform',
        'moderator',
        'Moderator',
        'moderator',
        'none',
        0,
        datetime('now')
    ),
    (
        'role-admin',
        'admin@markdown.platform',
        'admin',
        'Admin',
        'admin',
        'none',
        0,
        datetime('now')
    );

-- Insert sample categories
INSERT INTO
    tags (
        id,
        name,
        slug,
        description,
        usage_count,
        created_at
    )
VALUES (
        'tag-1',
        'Technology',
        'technology',
        'Tech articles and tutorials',
        0,
        datetime('now')
    ),
    (
        'tag-2',
        'Development',
        'development',
        'Software development content',
        0,
        datetime('now')
    ),
    (
        'tag-3',
        'Design',
        'design',
        'UI/UX and design patterns',
        0,
        datetime('now')
    ),
    (
        'tag-4',
        'Tutorial',
        'tutorial',
        'Step-by-step guides',
        0,
        datetime('now')
    ),
    (
        'tag-5',
        'News',
        'news',
        'Latest news and updates',
        0,
        datetime('now')
    );

-- Insert sample bookmarks folders (collections)
INSERT INTO
    collections (
        id,
        author_id,
        title,
        description,
        is_private,
        created_at
    )
VALUES (
        'collection-1',
        'role-user',
        'Favorites',
        'My favorite documents',
        0,
        datetime('now')
    ),
    (
        'collection-2',
        'role-user',
        'Reading List',
        'Documents to read later',
        0,
        datetime('now')
    );