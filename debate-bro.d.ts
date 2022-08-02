const topicCategories = [ "Social", "Economic" ] as const;

declare type TopicCategory = typeof topicCategories[number];

declare type Topic = {
    Category: TopicCategory;
    Name: string
} 