import {Service} from "typedi";
import {InjectRepository} from "typeorm-typedi-extensions";
import {ArticleQueryRepository} from "../../repository/article/ArticleQueryRepository";
import {ArticleCreateDto} from "./dto/ArticleCreateDto";
import {EntityManager, Transaction, TransactionManager} from "typeorm";
import { Article } from "../../entity/article/Article";
import logger from "../../config/logger";

@Service()
export class ArticleService {
    constructor(
        @InjectRepository() private articleQueryRepository: ArticleQueryRepository,
        ) {}

    async findAll(): Promise<Article[]> {
        return await this.articleQueryRepository.findAll();
    }

    @Transaction()
    async create(
        articleCreateDto: ArticleCreateDto,
        @TransactionManager() manager?: EntityManager
    ): Promise<Number> {
        // @ts-ignore
        const article = await manager.save(articleCreateDto.toEntity());
        return Number(article.id);
    }

    @Transaction()
    async publish(
        id: number,
        @TransactionManager() manager?: EntityManager
    ): Promise<void> {
        const article = await this.articleQueryRepository.findOneById(id);
        if(article === undefined) {
            logger.info(`ID:${id} article이 존재하지 않습니다.`);
            return ;
        }

        article.publish();
        // @ts-ignore
        await manager.save(article);
    }

}
