const topicCategories = [ "Social", "Economic" ] as const;

declare type TopicCategory = typeof topicCategories[number] | string;

declare type Topic = {
    category: TopicCategory;
    name: string;
} 