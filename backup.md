### 2026-04-26

- risky_tweak - But I feel like I'm going to make it worse if  Ido it like...Hold on, let me try
- changed_mind - Actually, I changed my8 mind.
- match_hair - I wish I could match the hair specifically
- where_would_it_be - Where would it be? This is so useful
- dont_see_it - I don't see it
- evil_read - He's evil, I think he is kind of eval, I'm pretty sure
- chill_check - Okay, yean, let's go, is he chill? (他好相处吗？随和、不紧张、容易相处)
- safe_convention - This is the safe convention (这是稳妥的做法)
- release_bump - Try `npm run release -- 1.0.0` to bump everything and inspect the diff. (碰撞/提升/增加/顶贴/升级版本号)
- release_publish - When you are ready to ship, run `npm run release -- publish` to publish (船/发布/发货/上线/交付)
- what_supposed_to_be - What is this supposed to be
- indecisive_adjust - Hold on, I think I'm going to adjust some stuff. I don't know, I'm indecisive, you know (/ˌɪndɪ'saɪsɪv/ 我犹豫不决)
- dead_option - No, no, no. that's dead. No, maybe like this.
- circles_shape - Is this kind of like circles?
- cant_tell_anymore - I can't tell anymore (我已经看不出来了)
- nonsense_callout - You're not making any sense
- too_lewd - It's way too lewd (/'luːd/ 这太猥亵了)
- timing_warning - You gotta think about your timing (你得考虑一下时机)
- stimulating_expectation - I bet the real thing is gonna be really stimulating (/'stɪmjuleɪtɪŋ/ 刺激的)
- alone_different - I'm all alone, but it's different somehow (我一个人，但感觉有一种说不清楚的不一样)
- alone_no_leads - From when I'm alone looking for her with no leads, I'm nervous for some reason (当我一个人没有线索地寻找她时，我莫名其妙地感到紧张)
- blame_you - You made me do it (你让我这么做的)
- embarrassing_crap - Don't say embarrassing crap like that (别说那种尴尬的话)
- indecent_behavior - Indecent behavior (/ɪn'diːsnt/ 不端/不雅行为)
- never_intimate - I guess that means she's never been intimate with human being (/'ɪntɪmət/ 她从来没有和人类有过亲密关系)
- closer_transceiver - Maybe it will help us get a little bit closer to her on wristwatch transceiver (/'rɪstwɑːtʃ/ /træn'siːvər/ 手表对讲机)
- start_friends - I thought we could start by being friends
- no_other_friends - You don't even have any other friends.
- kept_meaning_to_ask - I kept meaning to ask (我一直想问...但一直没问出口)
- face_check - What's with the face (你这表情是怎么回事？)
- when_known - From what point do you know that (你从什么时候知道的？)
- overcomplicated - I'm making this too complicated, aren't I? (我把这个弄得太复杂了，是吗？)
- at_one_point - Does that mean at one point (是不是意味着在某个时刻...)
- hand_in_person - Did I hand it to you in person? (我当面把它交给你了吗？)
- glad_okay - But anyway, I'm glad you're okay (不过不管怎样，我很高兴你没事)
- present_only - Everyone else only sees you the way you are now (其他人只看到你现在的样子)
- used_to_gloomy - You used to be pretty gloomy (/'ɡluːmi/, 你之前很抑郁的)
- used_to_standoffish - You were very standoffish (/stændˈɔfɪʃ/ 你之前很高冷的)
- token_feeling - And showed me by giving me a token of how you felt (代表/象征, 通过给我一个象征你感受的东西来向我展示)
- teasing_kick - You really get a kick out of teasing me, don't you? (/ˈtizɪŋ/ 戏弄, 逗我)
- take_care_things - I've gotta take care of some things (我得处理一些事情)
- routine_meeting - It's become my routine to meet with you (/ruː'tiːn/, 和你见面已经成了我的日常了)

### 2026-04-28 Hash Retrieval Method

- curve_schedule - The forgetting curve should schedule the next Key-to-Value retrieval, not another passive reread.
- key_value_only - Every raw line should become one keyed chunk: one specific Key and one retrievable Value.
- collision_limit - Keep each Key at 1-3 Values, and split it if hesitation starts.
- miss_rewire - If the Value doesn't show up in 0.5 seconds, the Key is too broad or the chunk is not sealed yet.

I like LLama-Factory as it integrates some of the libraries you mentioned and makes it relatively easy to use.

I agree Llama Factory is the way to go for standard stuff like SFT but for more complicated things where you need more flexibility, Unsloth is much better.

DeepSpeed is a deep learning optimization library that makes distributed training and inference easy, efficient, and effective.

Which one would you recommend to someone who is looking to dive deep


Unsloth actually does no quantization and no accuracy degradation! /'ækjərəsi/

that makes sense, but isnt it worth fine tuning using HF to learn about the nuts and bolts and then go to unsloth? Im trying to learn the finer details



Finer details as in what? 

Roughly speaking, finetuning only has the following components: dataset, effective batch size and learning rate (+ lora settings if peft).

What people don't seem to often understand is that beyond quantized models, Unsloth also does various optimized kernels and algorithms that reduce VRAM consumption and increase speed in consumer/prosumer hardware context in finetuning and inference.

It means that you can finetune bigger models with larger context and faster using Unsloth compared to HF TF, which is less optimized.



