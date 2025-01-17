import testConnection from "../../testConnection";
import {Article} from "../../../../src/entity/article/Article";
import {getCustomRepository} from "typeorm";
import {ArticleTransactionService} from "../../../../src/service/article/ArticleTransactionService";
import {ArticleCreateParam} from "../../../../src/service/article/dto/ArticleCreateParam";
import {ArticleRepository} from "../../../../src/entity/article/ArticleRepository";
import {ArticleQueryRepository} from "../../../../src/repository/article/ArticleQueryRepository";

describe('ArticleService CRUD', () => {
    let articleRepository: ArticleRepository;
    let articleQueryRepository: ArticleQueryRepository;
    let articleService: ArticleTransactionService;

    beforeEach(async () => {
        articleRepository = getCustomRepository(ArticleRepository);
        articleQueryRepository = getCustomRepository(ArticleQueryRepository);
        articleService = new ArticleTransactionService(articleQueryRepository);
    });

    afterEach(async () => {
        await testConnection.clear();
    });

    it('ArticleService create', async () => {
        // given
        const now = new Date();
        const targetTitle = '테스트';

        // when
        const id = await articleService.createTransaction(
            ArticleCreateParam.create(now, targetTitle, '테스트데이터', 'jojoldu'),
            false,
            null);

        // then
        expect(Number(id)).toBeGreaterThanOrEqual(1);
        const result = await articleRepository.findOne({title: targetTitle});
        expect(result.title).toBe(targetTitle);
    })

    it('ArticleService create and rollback', async () => {
        // given
        const now = new Date();
        const targetTitle = '테스트';

        // when
        try {
            await articleService.createTransaction(
                ArticleCreateParam.create(now, targetTitle, '테스트데이터', 'jojoldu'),
                true,
                null)
        } catch (e) {}

        // then
        const result = await articleRepository.findOne({title: targetTitle});
        expect(result).toBeUndefined();
    })

    it('ArticleService update', async () => {
        // given
        const now = new Date();
        const targetTitle = '테스트';
        const article = await articleRepository.save(Article.create(now, targetTitle, '테스트데이터', null));
        const id = article.id;

        // when
        await articleService.publishTransaction(id, false, null);

        // then
        const result = await articleQueryRepository.findOneById(id);
        expect(result.isPublished).toBe(true);
        expect(result.updatedAt >= now).toBeTruthy();
    })

    it('Article public 롤백시 isPublish는 상태가 원복된다', async () => {
        // given
        const now = new Date();
        const targetTitle = '테스트';
        const article = await articleRepository.save(Article.create(now, targetTitle, '테스트데이터', null));
        const id = article.id;

        // when
        try{
            await articleService.publishTransaction(id, true, null);
        }catch (e) {}

        // then
        const result = await articleQueryRepository.findOneById(id);
        expect(result.isPublished).toBe(false);
    })
})
