
import Copy from "../Copy/Copy";
import BrandIcon from "../BrandIcon/BrandIcon";
import { useThemeConfig } from "@/components/storefront-ui/storefront/ThemeConfigProvider";
import { EditableText } from "@/components/storefront-ui/edit/EditableText";

const TextBlock = () => {
  const theme = useThemeConfig();
  return (
    <section className="text-block">
      <div className="container">
        <div className="text-block-col">
          <Copy>
            <EditableText as="h3" label="Text block headline" path="textBlock.headline" fallback={theme.content.textBlock.headline} />
          </Copy>
          <div className="text-block-logo">
            <BrandIcon />
          </div>
        </div>
        <div className="text-block-col">
          <div className="text-block-copy">
            <Copy>
              <p className="bodyCopy sm">
                <EditableText
                  as="span"
                  label="Text block paragraph 1"
                  path="textBlock.paragraphs.0"
                  fallback={theme.content.textBlock.paragraphs[0]}
                  multiline
                />
              </p>
            </Copy>
          </div>
          <div className="text-block-copy">
            <Copy>
              <p className="bodyCopy sm">
                <EditableText
                  as="span"
                  label="Text block paragraph 2"
                  path="textBlock.paragraphs.1"
                  fallback={theme.content.textBlock.paragraphs[1]}
                  multiline
                />
              </p>
            </Copy>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextBlock;
