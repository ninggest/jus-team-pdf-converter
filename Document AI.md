
# Document AI

Mistral Document AI offers enterprise-level document processing, combining cutting-edge OCR technology with advanced structured data extraction. Experience faster processing speeds, unparalleled accuracy, and cost-effective solutions, all scalable to meet your needs.

<Image
  url={['/img/document_ai_overview.png', '/img/document_ai_overview_dark.png']}
  alt="document_ai_graph"
  width="500px"
  centered
/>

Unlock the full potential of your documents with our multilingual support, annotations and adaptable workflows for all document types, enabling you to extract, comprehend, and analyze information with ease.

<SectionTab as="h1" sectionId="document-ai-services">Document AI Services</SectionTab>

Using `client.ocr.process` in our SDK Clients as the entry point and/or the `https://api.mistral.ai/v1/ocr` endpoint, you can access the following services from our Document AI stack:

- [OCR Processor](document_ai/basic_ocr): Discover our OCR model and its extensive capabilities.
- [Annotations](document_ai/annotations): Annotate and extract data from your documents using our built-in Structured Outputs.
- [Document QnA](document_ai/document_qna): Harness the power of our vast models in conjunction with our OCR technology.

---
id: basic_ocr
title: OCR Processor
slug: basic_ocr
sidebar_position: 3.1
---

# Document AI - OCR Processor 

Mistral Document AI API comes with a Document OCR (Optical Character Recognition) processor, powered by our latest OCR model `mistral-ocr-latest`, which enables you to extract text and structured content from PDF documents. 

<Image
  url={['/img/basic_ocr_graph.png', '/img/basic_ocr_graph_dark.png']}
  alt="Basic OCR Graph"
  width="600px"
  centered
/>

<SectionTab as="h1" sectionId="before-you-start">Before You Start</SectionTab>

### Key Features

- **Extracts text** in content while maintaining document structure and hierarchy.
- Preserves formatting like headers, paragraphs, lists and tables.
  - **Table formatting** can be toggled between `null`, `markdown` and `html` via the `table_format` parameter.
    - `null`: Tables are returned inline as markdown within the extracted page.
    - `markdown`: Tables are returned as markdown tables separately.
    - `html`: Tables are returned as html tables separately.
- Option to **extract headers and footers** via the `extract_header` and the `extract_footer` parameter, when used, the headers and footers content will be provided in the `header` and `footer` fields. By default, headers and footers are considered as part of the main content output.
- Returns results in markdown format for easy parsing and rendering.
- Handles complex layouts including multi-column text and mixed content and returns hyperlinks when available.
- Processes documents at scale with high accuracy
- Supports multiple document formats including:
    - `image_url`: png, jpeg/jpg, avif and more...
    - `document_url`: pdf, pptx, docx and more...
    - For a non-exaustive more comprehensive list, visit our [FAQ](#faq).

Learn more about our API [here](https://docs.mistral.ai/api/endpoint/ocr).

:::info
Table formatting as well as header and footer extraction is only available for OCR 2512 or newer.
:::

The OCR processor returns the extracted **text content**, **images bboxes** and metadata about the document structure, making it easy to work with the recognized content programmatically.

<SectionTab as="h1" sectionId="ocr-images-and-pdfs">OCR with Images and PDFs</SectionTab>

### OCR your Documents

We provide different methods to OCR your documents. You can either OCR a **PDF** or an **Image**.

<SectionTab as="h2" variant="secondary" sectionId="ocr-pdfs">PDFs</SectionTab>

Among the PDF methods, you can use a **public available URL**, a **base64 encoded PDF** or by **uploading a PDF in our Cloud**.

<ExplorerTabs id="pdfs">
    <ExplorerTab value="pdf-url" label="OCR with a PDF Url">
        Be sure the URL is **public** and accessible by our API.

<Tabs groupId="code">
    <TabItem value="python" label="python">

```python
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]

client = Mistral(api_key=api_key)

ocr_response = client.ocr.process(
    model="mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2201.04234"
    },
    table_format="html", # default is None
    # extract_header=True, # default is False
    # extract_footer=True, # default is False
    include_image_base64=True
)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
        type: "document_url",
        documentUrl: "https://arxiv.org/pdf/2201.04234"
    },
    tableFormat: "html", // default is null
    // extractHeader: False, // default is False
    // extractFooter: False, // default is False
    includeImageBase64: true
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/ocr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
  -d '{
    "model": "mistral-ocr-latest",
    "document": {
        "type": "document_url",
        "document_url": "https://arxiv.org/pdf/2201.04234"
    },
    "table_format": "html",
    "include_image_base64": true
  }' -o ocr_output.json
```

  </TabItem>
  <TabItem value="output" label="output">

```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "# Leveraging Unlabeled Data to Predict Out-of-Distribution Performance\n\nSaurabh Garg\nCarnegie Mellon University\nsgarg2@andrew.cmu.edu\n&Sivaraman Balakrishnan\nCarnegie Mellon University\nsbalakri@andrew.cmu.edu\n&Zachary C. Lipton\nCarnegie Mellon University\nzlipton@andrew.cmu.edu\n&Behnam Neyshabur\nGoogle Research, Blueshift team\nneyshabur@google.com\n&Hanie Sedghi\nGoogle Research, Brain team\nhsedghi@google.com\n\n###### Abstract\n\nReal-world machine learning deployments are characterized by mismatches between the source (training) and target (test) distributions that may cause performance drops. In this work, we investigate methods for predicting the target domain accuracy using only labeled source data and unlabeled target data. We propose Average Thresholded Confidence (ATC), a practical method that learns a threshold on the model’s confidence, predicting accuracy as the fraction of unlabeled examples for which model confidence exceeds that threshold. ATC outperforms previous methods across several model architectures, types of distribution shifts (e.g., due to synthetic corruptions, dataset reproduction, or novel subpopulations), and datasets (Wilds, ImageNet, Breeds, CIFAR, and MNIST). In our experiments, ATC estimates target performance $2$–$4\\times$ more accurately than prior methods. We also explore the theoretical foundations of the problem, proving that, in general, identifying the accuracy is just as hard as identifying the optimal predictor and thus, the efficacy of any method rests upon (perhaps unstated) assumptions on the nature of the shift. Finally, analyzing our method on some toy distributions, we provide insights concerning when it works.\n\n## 1 Introduction\n\nMachine learning models deployed in the real world typically encounter examples from previously unseen distributions. While the IID assumption enables us to evaluate models using held-out data from the source distribution (from which training data is sampled), this estimate is no longer valid in presence of a distribution shift. Moreover, under such shifts, model accuracy tends to degrade *(Szegedy et al., 2014; Recht et al., 2019; Koh et al., 2021)*. Commonly, the only data available to the practitioner are a labeled training set (source) and unlabeled deployment-time data which makes the problem more difficult. In this setting, detecting shifts in the distribution of covariates is known to be possible (but difficult) in theory *(Ramdas et al., 2015)*, and in practice *(Rabanser et al., 2018)*. However, producing an optimal predictor using only labeled source and unlabeled target data is well-known to be impossible absent further assumptions *(Ben-David et al., 2010; Lipton et al., 2018)*.\n\nTwo vital questions that remain are: (i) the precise conditions under which we can estimate a classifier’s target-domain accuracy; and (ii) which methods are most practically useful. To begin, the straightforward way to assess the performance of a model under distribution shift would be to collect labeled (target domain) examples and then to evaluate the model on that data. However, collecting fresh labeled data from the target distribution is prohibitively expensive and time-consuming, especially if the target distribution is non-stationary. Hence, instead of using labeled data, we aim to use unlabeled data from the target distribution, that is comparatively abundant, to predict model performance. Note that in this work, our focus is not to improve performance on the target but, rather, to estimate the accuracy on the target for a given classifier.",
      "images": [],
      "tables": [],
      "hyperlinks": [
        "mailto:sgarg2%40andrew.cmu.edu",
        "mailto:sbalakri%40andrew.cmu.edu",
        "mailto:zlipton%40andrew.cmu.edu",
        "mailto:neyshabur%40google.com",
        "mailto:hsedghi%40google.com",
        "https://github.com/saurabhgarg1996/ATC_code"
      ],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 1,
      "markdown": "Published as a conference paper at ICLR 2022\n\n![img-0.jpeg](img-0.jpeg)\nFigure 1: Illustration of our proposed method ATC. Left: using source domain validation data, we identify a threshold on a score (e.g. negative entropy) computed on model confidence such that fraction of examples above the threshold matches the validation set accuracy. ATC estimates accuracy on unlabeled target data as the fraction of examples with the score above the threshold. Interestingly, this threshold yields accurate estimates on a wide set of target distributions resulting from natural and synthetic shifts. Right: Efficacy of ATC over previously proposed approaches on our testbed with a post-hoc calibrated model. To obtain errors on the same scale, we rescale all errors with Average Confidence (AC) error. Lower estimation error is better. See Table 1 for exact numbers and comparison on various types of distribution shift. See Sec. 5 for details on our testbed.\n\n![img-1.jpeg](img-1.jpeg)\n\nRecently, numerous methods have been proposed for this purpose (Deng &amp; Zheng, 2021; Chen et al., 2021b; Jiang et al., 2021; Deng et al., 2021; Guillory et al., 2021). These methods either require calibration on the target domain to yield consistent estimates (Jiang et al., 2021; Guillory et al., 2021) or additional labeled data from several target domains to learn a linear regression function on a distributional distance that then predicts model performance (Deng et al., 2021; Deng &amp; Zheng, 2021; Guillory et al., 2021). However, methods that require calibration on the target domain typically yield poor estimates since deep models trained and calibrated on source data are not, in general, calibrated on a (previously unseen) target domain (Ovadia et al., 2019). Besides, methods that leverage labeled data from target domains rely on the fact that unseen target domains exhibit strong linear correlation with seen target domains on the underlying distance measure and, hence, can be rendered ineffective when such target domains with labeled data are unavailable (in Sec. 5.1 we demonstrate such a failure on a real-world distribution shift problem). Therefore, throughout the paper, we assume access to labeled source data and only unlabeled data from target domain(s).\n\nIn this work, we first show that absent assumptions on the source classifier or the nature of the shift, no method of estimating accuracy will work generally (even in non-contrived settings). To estimate accuracy on target domain perfectly, we highlight that even given perfect knowledge of the labeled source distribution (i.e.,  $p_{s}(x,y)$ ) and unlabeled target distribution (i.e.,  $p_{t}(x)$ ), we need restrictions on the nature of the shift such that we can uniquely identify the target conditional  $p_{t}(y|x)$ . Thus, in general, identifying the accuracy of the classifier is as hard as identifying the optimal predictor.\n\nSecond, motivated by the superiority of methods that use maximum softmax probability (or logit) of a model for Out-Of-Distribution (OOD) detection (Hendrycks &amp; Gimpel, 2016; Hendrycks et al., 2019), we propose a simple method that leverages softmax probability to predict model performance. Our method, Average Thresholded Confidence (ATC), learns a threshold on a score (e.g., maximum confidence or negative entropy) of model confidence on validation source data and predicts target domain accuracy as the fraction of unlabeled target points that receive a score above that threshold. ATC selects a threshold on validation source data such that the fraction of source examples that receive the score above the threshold match the accuracy of those examples. Our primary contribution in ATC is the proposal of obtaining the threshold and observing its efficacy on (practical) accuracy estimation. Importantly, our work takes a step forward in positively answering the question raised in Deng &amp; Zheng (2021); Deng et al. (2021) about a practical strategy to select a threshold that enables accuracy prediction with thresholded model confidence.",
      "images": [
        {
          "id": "img-0.jpeg",
          "top_left_x": 294,
          "top_left_y": 222,
          "bottom_right_x": 943,
          "bottom_right_y": 635,
          "image_base64": "data:image/jpeg;base64,...",
          "image_annotation": null
        }
      ],
      "tables": [],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 27,
      "markdown": "Published as a conference paper at ICLR 2022\n\n[tbl-3.html](tbl-3.html)\n\nTable 3: Mean Absolute estimation Error (MAE) results for different datasets in our setup grouped by the nature of shift. 'Same' refers to same subpopulation shifts and 'Novel' refers novel subpopulation shifts. We include details about the target sets considered in each shift in Table 2. Post T denotes use of TS calibration on source. For language datasets, we use DistilBERT-base-uncased, for vision dataset we report results with DenseNet model with the exception of MNIST where we use FCN. Across all datasets, we observe that ATC achieves superior performance (lower MAE is better). For GDE post T and pre T estimates match since TS doesn't alter the argmax prediction. Results reported by aggregating MAE numbers over 4 different seeds. Values in parenthesis (i.e.,  $(\\cdot)$ ) denote standard deviation values.",
      "images": [],
      "tables": [
        {
          "id": "tbl-3.html",
          "content": "<table><tr><td rowspan=\"2\">Dataset</td><td rowspan=\"2\">Shift</td><td colspan=\"2\">IM</td><td colspan=\"2\">AC</td><td colspan=\"2\">DOC</td><td>GDE</td><td colspan=\"2\">ATC-MC (Ours)</td><td colspan=\"2\">ATC-NE (Ours)</td></tr><tr><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td></tr><tr><td rowspan=\"4\">CIFAR10</td><td rowspan=\"2\">Natural</td><td>6.60</td><td>5.74</td><td>9.88</td><td>6.89</td><td>7.25</td><td>6.07</td><td>4.77</td><td>3.21</td><td>3.02</td><td>2.99</td><td>2.85</td></tr><tr><td>(0.35)</td><td>(0.30)</td><td>(0.16)</td><td>(0.13)</td><td>(0.15)</td><td>(0.16)</td><td>(0.13)</td><td>(0.49)</td><td>(0.40)</td><td>(0.37)</td><td>(0.29)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>12.33</td><td>10.20</td><td>16.50</td><td>11.91</td><td>13.87</td><td>11.08</td><td>6.55</td><td>4.65</td><td>4.25</td><td>4.21</td><td>3.87</td></tr><tr><td>(0.51)</td><td>(0.48)</td><td>(0.26)</td><td>(0.17)</td><td>(0.18)</td><td>(0.17)</td><td>(0.35)</td><td>(0.55)</td><td>(0.55)</td><td>(0.55)</td><td>(0.75)</td></tr><tr><td rowspan=\"2\">CIFAR100</td><td rowspan=\"2\">Synthetic</td><td>13.69</td><td>11.51</td><td>23.61</td><td>13.10</td><td>14.60</td><td>10.14</td><td>9.85</td><td>5.50</td><td>4.75</td><td>4.72</td><td>4.94</td></tr><tr><td>(0.55)</td><td>(0.41)</td><td>(1.16)</td><td>(0.80)</td><td>(0.77)</td><td>(0.64)</td><td>(0.57)</td><td>(0.70)</td><td>(0.73)</td><td>(0.74)</td><td>(0.74)</td></tr><tr><td rowspan=\"4\">ImageNet200</td><td rowspan=\"2\">Natural</td><td>12.37</td><td>8.19</td><td>22.07</td><td>8.61</td><td>15.17</td><td>7.81</td><td>5.13</td><td>4.37</td><td>2.04</td><td>3.79</td><td>1.45</td></tr><tr><td>(0.25)</td><td>(0.33)</td><td>(0.08)</td><td>(0.25)</td><td>(0.11)</td><td>(0.29)</td><td>(0.08)</td><td>(0.39)</td><td>(0.24)</td><td>(0.30)</td><td>(0.27)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>19.86</td><td>12.94</td><td>32.44</td><td>13.35</td><td>25.02</td><td>12.38</td><td>5.41</td><td>5.93</td><td>3.09</td><td>5.00</td><td>2.68</td></tr><tr><td>(1.38)</td><td>(1.81)</td><td>(1.00)</td><td>(1.30)</td><td>(1.10)</td><td>(1.38)</td><td>(0.89)</td><td>(1.38)</td><td>(0.87)</td><td>(1.28)</td><td>(0.45)</td></tr><tr><td rowspan=\"4\">ImageNet</td><td rowspan=\"2\">Natural</td><td>7.77</td><td>6.50</td><td>18.13</td><td>6.02</td><td>8.13</td><td>5.76</td><td>6.23</td><td>3.88</td><td>2.17</td><td>2.06</td><td>0.80</td></tr><tr><td>(0.27)</td><td>(0.33)</td><td>(0.23)</td><td>(0.34)</td><td>(0.27)</td><td>(0.37)</td><td>(0.41)</td><td>(0.53)</td><td>(0.62)</td><td>(0.54)</td><td>(0.44)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>13.39</td><td>10.12</td><td>24.62</td><td>8.51</td><td>13.55</td><td>7.90</td><td>6.32</td><td>3.34</td><td>2.53</td><td>2.61</td><td>4.89</td></tr><tr><td>(0.53)</td><td>(0.63)</td><td>(0.64)</td><td>(0.71)</td><td>(0.61)</td><td>(0.72)</td><td>(0.33)</td><td>(0.53)</td><td>(0.36)</td><td>(0.33)</td><td>(0.83)</td></tr><tr><td rowspan=\"2\">FMoW-WILDS</td><td rowspan=\"2\">Natural</td><td>5.53</td><td>4.31</td><td>33.53</td><td>12.84</td><td>5.94</td><td>4.45</td><td>5.74</td><td>3.06</td><td>2.70</td><td>3.02</td><td>2.72</td></tr><tr><td>(0.33)</td><td>(0.63)</td><td>(0.13)</td><td>(12.06)</td><td>(0.36)</td><td>(0.77)</td><td>(0.55)</td><td>(0.36)</td><td>(0.54)</td><td>(0.35)</td><td>(0.44)</td></tr><tr><td rowspan=\"2\">RxRx1-WILDS</td><td rowspan=\"2\">Natural</td><td>5.80</td><td>5.72</td><td>7.90</td><td>4.84</td><td>5.98</td><td>5.98</td><td>6.03</td><td>4.66</td><td>4.56</td><td>4.41</td><td>4.47</td></tr><tr><td>(0.17)</td><td>(0.15)</td><td>(0.24)</td><td>(0.09)</td><td>(0.15)</td><td>(0.13)</td><td>(0.08)</td><td>(0.38)</td><td>(0.38)</td><td>(0.31)</td><td>(0.26)</td></tr><tr><td rowspan=\"2\">Amazon-WILDS</td><td rowspan=\"2\">Natural</td><td>2.40</td><td>2.29</td><td>8.01</td><td>2.38</td><td>2.40</td><td>2.28</td><td>17.87</td><td>1.65</td><td>1.62</td><td>1.60</td><td>1.59</td></tr><tr><td>(0.08)</td><td>(0.09)</td><td>(0.53)</td><td>(0.17)</td><td>(0.09)</td><td>(0.09)</td><td>(0.18)</td><td>(0.06)</td><td>(0.05)</td><td>(0.14)</td><td>(0.15)</td></tr><tr><td rowspan=\"2\">CivilCom.-WILDS</td><td rowspan=\"2\">Natural</td><td>12.64</td><td>10.80</td><td>16.76</td><td>11.03</td><td>13.31</td><td>10.99</td><td>16.65</td><td></td><td>7.14</td><td></td><td></td></tr><tr><td>(0.52)</td><td>(0.48)</td><td>(0.53)</td><td>(0.49)</td><td>(0.52)</td><td>(0.49)</td><td>(0.25)</td><td></td><td>(0.41)</td><td></td><td></td></tr><tr><td rowspan=\"2\">MNIST</td><td rowspan=\"2\">Natural</td><td>18.48</td><td>15.99</td><td>21.17</td><td>14.81</td><td>20.19</td><td>14.56</td><td>24.42</td><td>5.02</td><td>2.40</td><td>3.14</td><td>3.50</td></tr><tr><td>(0.45)</td><td>(1.53)</td><td>(0.24)</td><td>(3.89)</td><td>(0.23)</td><td>(3.47)</td><td>(0.41)</td><td>(0.44)</td><td>(1.83)</td><td>(0.49)</td><td>(0.17)</td></tr><tr><td rowspan=\"4\">ENTITY-13</td><td rowspan=\"2\">Same</td><td>16.23</td><td>11.14</td><td>24.97</td><td>10.88</td><td>19.08</td><td>10.47</td><td>10.71</td><td>5.39</td><td>3.88</td><td>4.58</td><td>4.19</td></tr><tr><td>(0.77)</td><td>(0.65)</td><td>(0.70)</td><td>(0.77)</td><td>(0.65)</td><td>(0.72)</td><td>(0.74)</td><td>(0.92)</td><td>(0.61)</td><td>(0.85)</td><td>(0.16)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.53</td><td>22.02</td><td>38.33</td><td>21.64</td><td>32.43</td><td>21.22</td><td>20.61</td><td>13.58</td><td>10.28</td><td>12.25</td><td>6.63</td></tr><tr><td>(0.82)</td><td>(0.68)</td><td>(0.75)</td><td>(0.86)</td><td>(0.69)</td><td>(0.80)</td><td>(0.60)</td><td>(1.15)</td><td>(1.34)</td><td>(1.21)</td><td>(0.93)</td></tr><tr><td rowspan=\"4\">ENTITY-30</td><td rowspan=\"2\">Same</td><td>18.59</td><td>14.46</td><td>28.82</td><td>14.30</td><td>21.63</td><td>13.46</td><td>12.92</td><td>9.12</td><td>7.75</td><td>8.15</td><td>7.64</td></tr><tr><td>(0.51)</td><td>(0.52)</td><td>(0.43)</td><td>(0.71)</td><td>(0.37)</td><td>(0.59)</td><td>(0.14)</td><td>(0.62)</td><td>(0.72)</td><td>(0.68)</td><td>(0.88)</td></tr><tr><td rowspan=\"2\">Novel</td><td>32.34</td><td>26.85</td><td>44.02</td><td>26.27</td><td>36.82</td><td>25.42</td><td>23.16</td><td>17.75</td><td>14.30</td><td>15.60</td><td>10.57</td></tr><tr><td>(0.60)</td><td>(0.58)</td><td>(0.56)</td><td>(0.79)</td><td>(0.47)</td><td>(0.68)</td><td>(0.12)</td><td>(0.76)</td><td>(0.85)</td><td>(0.86)</td><td>(0.86)</td></tr><tr><td rowspan=\"4\">NONLIVING-26</td><td rowspan=\"2\">Same</td><td>18.66</td><td>17.17</td><td>26.39</td><td>16.14</td><td>19.86</td><td>15.58</td><td>16.63</td><td>10.87</td><td>10.24</td><td>10.07</td><td>10.26</td></tr><tr><td>(0.76)</td><td>(0.74)</td><td>(0.82)</td><td>(0.81)</td><td>(0.67)</td><td>(0.76)</td><td>(0.45)</td><td>(0.98)</td><td>(0.83)</td><td>(0.92)</td><td>(1.18)</td></tr><tr><td rowspan=\"2\">Novel</td><td>33.43</td><td>31.53</td><td>41.66</td><td>29.87</td><td>35.13</td><td>29.31</td><td>29.56</td><td>21.70</td><td>20.12</td><td>19.08</td><td>18.26</td></tr><tr><td>(0.67)</td><td>(0.65)</td><td>(0.67)</td><td>(0.71)</td><td>(0.54)</td><td>(0.64)</td><td>(0.21)</td><td>(0.86)</td><td>(0.75)</td><td>(0.82)</td><td>(1.12)</td></tr><tr><td rowspan=\"4\">LIVING-17</td><td rowspan=\"2\">Same</td><td>12.63</td><td>11.05</td><td>18.32</td><td>10.46</td><td>14.43</td><td>10.14</td><td>9.87</td><td>4.57</td><td>3.95</td><td>3.81</td><td>4.21</td></tr><tr><td>(1.25)</td><td>(1.20)</td><td>(1.01)</td><td>(1.12)</td><td>(1.11)</td><td>(1.16)</td><td>(0.61)</td><td>(0.71)</td><td>(0.48)</td><td>(0.22)</td><td>(0.53)</td></tr><tr><td rowspan=\"2\">Novel</td><td>29.03</td><td>26.96</td><td>35.67</td><td>26.11</td><td>31.73</td><td>25.73</td><td>23.53</td><td>16.15</td><td>14.49</td><td>12.97</td><td>11.39</td></tr><tr><td>(1.44)</td><td>(1.38)</td><td>(1.09)</td><td>(1.27)</td><td>(1.19)</td><td>(1.35)</td><td>(0.52)</td><td>(1.36)</td><td>(1.46)</td><td>(1.52)</td><td>(1.72)</td></tr></table>",
          "format": "html"
        }
      ],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 28,
      "markdown": "Published as a conference paper at ICLR 2022\n\n[tbl-4.html](tbl-4.html)\n\nTable 4: Mean Absolute estimation Error (MAE) results for different datasets in our setup grouped by the nature of shift for ResNet model. 'Same' refers to same subpopulation shifts and 'Novel' refers novel subpopulation shifts. We include details about the target sets considered in each shift in Table 2. Post T denotes use of TS calibration on source. Across all datasets, we observe that ATC achieves superior performance (lower MAE is better). For GDE post T and pre T estimates match since TS doesn't alter the argmax prediction. Results reported by aggregating MAE numbers over 4 different seeds. Values in parenthesis (i.e.,  $(\\cdot)$ ) denote standard deviation values.",
      "images": [],
      "tables": [
        {
          "id": "tbl-4.html",
          "content": "<table><tr><td rowspan=\"2\">Dataset</td><td rowspan=\"2\">Shift</td><td colspan=\"2\">IM</td><td colspan=\"2\">AC</td><td colspan=\"2\">DOC</td><td>GDE</td><td colspan=\"2\">ATC-MC (Ours)</td><td colspan=\"2\">ATC-NE (Ours)</td></tr><tr><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td></tr><tr><td rowspan=\"4\">CIFAR10</td><td rowspan=\"2\">Natural</td><td>7.14</td><td>6.20</td><td>10.25</td><td>7.06</td><td>7.68</td><td>6.35</td><td>5.74</td><td>4.02</td><td>3.85</td><td>3.76</td><td>3.38</td></tr><tr><td>(0.14)</td><td>(0.11)</td><td>(0.31)</td><td>(0.33)</td><td>(0.28)</td><td>(0.27)</td><td>(0.25)</td><td>(0.38)</td><td>(0.30)</td><td>(0.33)</td><td>(0.32)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>12.62</td><td>10.75</td><td>16.50</td><td>11.91</td><td>13.93</td><td>11.20</td><td>7.97</td><td>5.66</td><td>5.03</td><td>4.87</td><td>3.63</td></tr><tr><td>(0.76)</td><td>(0.71)</td><td>(0.28)</td><td>(0.24)</td><td>(0.29)</td><td>(0.28)</td><td>(0.13)</td><td>(0.64)</td><td>(0.71)</td><td>(0.71)</td><td>(0.62)</td></tr><tr><td rowspan=\"2\">CIFAR100</td><td rowspan=\"2\">Synthetic</td><td>12.77</td><td>12.34</td><td>16.89</td><td>12.73</td><td>11.18</td><td>9.63</td><td>12.00</td><td>5.61</td><td>5.55</td><td>5.65</td><td>5.76</td></tr><tr><td>(0.43)</td><td>(0.68)</td><td>(0.20)</td><td>(2.59)</td><td>(0.35)</td><td>(1.25)</td><td>(0.48)</td><td>(0.51)</td><td>(0.55)</td><td>(0.35)</td><td>(0.27)</td></tr><tr><td rowspan=\"4\">ImageNet200</td><td rowspan=\"2\">Natural</td><td>12.63</td><td>7.99</td><td>23.08</td><td>7.22</td><td>15.40</td><td>6.33</td><td>5.00</td><td>4.60</td><td>1.80</td><td>4.06</td><td>1.38</td></tr><tr><td>(0.59)</td><td>(0.47)</td><td>(0.31)</td><td>(0.22)</td><td>(0.42)</td><td>(0.24)</td><td>(0.36)</td><td>(0.63)</td><td>(0.17)</td><td>(0.69)</td><td>(0.29)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>20.17</td><td>11.74</td><td>33.69</td><td>9.51</td><td>25.49</td><td>8.61</td><td>4.19</td><td>5.37</td><td>2.78</td><td>4.53</td><td>3.58</td></tr><tr><td>(0.74)</td><td>(0.80)</td><td>(0.73)</td><td>(0.51)</td><td>(0.66)</td><td>(0.50)</td><td>(0.14)</td><td>(0.88)</td><td>(0.23)</td><td>(0.79)</td><td>(0.33)</td></tr><tr><td rowspan=\"4\">ImageNet</td><td rowspan=\"2\">Natural</td><td>8.09</td><td>6.42</td><td>21.66</td><td>5.91</td><td>8.53</td><td>5.21</td><td>5.90</td><td>3.93</td><td>1.89</td><td>2.45</td><td>0.73</td></tr><tr><td>(0.25)</td><td>(0.28)</td><td>(0.38)</td><td>(0.22)</td><td>(0.26)</td><td>(0.25)</td><td>(0.44)</td><td>(0.26)</td><td>(0.21)</td><td>(0.16)</td><td>(0.10)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>13.93</td><td>9.90</td><td>28.05</td><td>7.56</td><td>13.82</td><td>6.19</td><td>6.70</td><td>3.33</td><td>2.55</td><td>2.12</td><td>5.06</td></tr><tr><td>(0.14)</td><td>(0.23)</td><td>(0.39)</td><td>(0.13)</td><td>(0.31)</td><td>(0.07)</td><td>(0.52)</td><td>(0.25)</td><td>(0.25)</td><td>(0.31)</td><td>(0.27)</td></tr><tr><td rowspan=\"2\">FMoW-WILDS</td><td rowspan=\"2\">Natural</td><td>5.15</td><td>3.55</td><td>34.64</td><td>5.03</td><td>5.58</td><td>3.46</td><td>5.08</td><td>2.59</td><td>2.33</td><td>2.52</td><td>2.22</td></tr><tr><td>(0.19)</td><td>(0.41)</td><td>(0.22)</td><td>(0.29)</td><td>(0.17)</td><td>(0.37)</td><td>(0.46)</td><td>(0.32)</td><td>(0.28)</td><td>(0.25)</td><td>(0.30)</td></tr><tr><td rowspan=\"2\">RxRx1-WILDS</td><td rowspan=\"2\">Natural</td><td>6.17</td><td>6.11</td><td>21.05</td><td>5.21</td><td>6.54</td><td>6.27</td><td>6.82</td><td>5.30</td><td>5.20</td><td>5.19</td><td>5.63</td></tr><tr><td>(0.20)</td><td>(0.24)</td><td>(0.31)</td><td>(0.18)</td><td>(0.21)</td><td>(0.20)</td><td>(0.31)</td><td>(0.30)</td><td>(0.44)</td><td>(0.43)</td><td>(0.55)</td></tr><tr><td rowspan=\"4\">ENTITY-13</td><td rowspan=\"2\">Same</td><td>18.32</td><td>14.38</td><td>27.79</td><td>13.56</td><td>20.50</td><td>13.22</td><td>16.09</td><td>9.35</td><td>7.50</td><td>7.80</td><td>6.94</td></tr><tr><td>(0.29)</td><td>(0.53)</td><td>(1.18)</td><td>(0.58)</td><td>(0.47)</td><td>(0.58)</td><td>(0.84)</td><td>(0.79)</td><td>(0.65)</td><td>(0.62)</td><td>(0.71)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.82</td><td>24.03</td><td>38.97</td><td>22.96</td><td>31.66</td><td>22.61</td><td>25.26</td><td>17.11</td><td>13.96</td><td>14.75</td><td>9.94</td></tr><tr><td>(0.30)</td><td>(0.55)</td><td>(1.32)</td><td>(0.59)</td><td>(0.54)</td><td>(0.58)</td><td>(1.08)</td><td>(0.84)</td><td>(0.93)</td><td>(0.64)</td><td>(0.78)</td></tr><tr><td rowspan=\"4\">ENTITY-30</td><td rowspan=\"2\">Same</td><td>16.91</td><td>14.61</td><td>26.84</td><td>14.37</td><td>18.60</td><td>13.11</td><td>13.74</td><td>8.54</td><td>7.94</td><td>7.77</td><td>8.04</td></tr><tr><td>(1.33)</td><td>(1.11)</td><td>(2.15)</td><td>(1.34)</td><td>(1.69)</td><td>(1.30)</td><td>(1.07)</td><td>(1.47)</td><td>(1.38)</td><td>(1.44)</td><td>(1.51)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.66</td><td>25.83</td><td>39.21</td><td>25.03</td><td>30.95</td><td>23.73</td><td>23.15</td><td>15.57</td><td>13.24</td><td>12.44</td><td>11.05</td></tr><tr><td>(1.16)</td><td>(0.88)</td><td>(2.03)</td><td>(1.11)</td><td>(1.64)</td><td>(1.11)</td><td>(0.51)</td><td>(1.44)</td><td>(1.15)</td><td>(1.26)</td><td>(1.13)</td></tr><tr><td rowspan=\"4\">NONLIVING-26</td><td rowspan=\"2\">Same</td><td>17.43</td><td>15.95</td><td>27.70</td><td>15.40</td><td>18.06</td><td>14.58</td><td>16.99</td><td>10.79</td><td>10.13</td><td>10.05</td><td>10.29</td></tr><tr><td>(0.90)</td><td>(0.86)</td><td>(0.90)</td><td>(0.69)</td><td>(1.00)</td><td>(0.78)</td><td>(1.25)</td><td>(0.62)</td><td>(0.32)</td><td>(0.46)</td><td>(0.79)</td></tr><tr><td rowspan=\"2\">Novel</td><td>29.51</td><td>27.75</td><td>40.02</td><td>26.77</td><td>30.36</td><td>25.93</td><td>27.70</td><td>19.64</td><td>17.75</td><td>16.90</td><td>15.69</td></tr><tr><td>(0.86)</td><td>(0.82)</td><td>(0.76)</td><td>(0.82)</td><td>(0.95)</td><td>(0.80)</td><td>(1.42)</td><td>(0.68)</td><td>(0.53)</td><td>(0.60)</td><td>(0.83)</td></tr><tr><td rowspan=\"4\">LIVING-17</td><td rowspan=\"2\">Same</td><td>14.28</td><td>12.21</td><td>23.46</td><td>11.16</td><td>15.22</td><td>10.78</td><td>10.49</td><td>4.92</td><td>4.23</td><td>4.19</td><td>4.73</td></tr><tr><td>(0.96)</td><td>(0.93)</td><td>(1.16)</td><td>(0.90)</td><td>(0.96)</td><td>(0.99)</td><td>(0.97)</td><td>(0.57)</td><td>(0.42)</td><td>(0.35)</td><td>(0.24)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.91</td><td>26.35</td><td>38.62</td><td>24.91</td><td>30.32</td><td>24.52</td><td>22.49</td><td>15.42</td><td>13.02</td><td>12.29</td><td>10.34</td></tr><tr><td>(0.66)</td><td>(0.73)</td><td>(1.01)</td><td>(0.61)</td><td>(0.59)</td><td>(0.74)</td><td>(0.85)</td><td>(0.59)</td><td>(0.53)</td><td>(0.73)</td><td>(0.62)</td></tr></table>",
          "format": "html"
        }
      ],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    }
  ],
  "model": "mistral-ocr-2512",
  "document_annotation": null,
  "usage_info": {
    "pages_processed": 29,
    "doc_size_bytes": 3002783
  }
}
```
    </TabItem>
</Tabs>
    </ExplorerTab>
    <ExplorerTab value="base64-encoded-pdf" label="OCR with a Base64 Encoded PDF">
        A method to upload local pdf files, is by **encoding them in base64 and passing them as a data url**.
<Tabs groupId="code">
    <TabItem value="python" label="python">

```python
import base64
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]

client = Mistral(api_key=api_key)

def encode_pdf(pdf_path):
    with open(pdf_path, "rb") as pdf_file:
        return base64.b64encode(pdf_file.read()).decode('utf-8')

pdf_path = "path_to_your_pdf.pdf"
base64_pdf = encode_pdf(pdf_path)

ocr_response = client.ocr.process(
    model="mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": f"data:application/pdf;base64,{base64_pdf}" 
    },
    table_format="html", # default is None
    # extract_header=True, # default is False
    # extract_footer=True, # default is False
    include_image_base64=True
)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```ts

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

async function encodePdf(pdfPath) {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Pdf = pdfBuffer.toString('base64');
    return base64Pdf;
}

const pdfPath = "path_to_your_pdf.pdf";
const base64Pdf = await encodePdf(pdfPath);

const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
        type: "document_url",
        documentUrl: "data:application/pdf;base64," + base64Pdf
    },
    tableFormat: "html", // default is null
    // extractHeader: False, // default is False
    // extractFooter: False, // default is False
    includeImageBase64: true
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/ocr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
  -d '{
    "model": "mistral-ocr-latest",
    "document": {
        "type": "document_url",
        "document_url": "data:application/pdf;base64,<base64_pdf>"
    },
    "table_format": "html",
    "include_image_base64": true
  }' -o ocr_output.json
```
  </TabItem>
  <TabItem value="output" label="output">
```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "# Leveraging Unlabeled Data to Predict Out-of-Distribution Performance\n\nSaurabh Garg\nCarnegie Mellon University\nsgarg2@andrew.cmu.edu\n&Sivaraman Balakrishnan\nCarnegie Mellon University\nsbalakri@andrew.cmu.edu\n&Zachary C. Lipton\nCarnegie Mellon University\nzlipton@andrew.cmu.edu\n&Behnam Neyshabur\nGoogle Research, Blueshift team\nneyshabur@google.com\n&Hanie Sedghi\nGoogle Research, Brain team\nhsedghi@google.com\n\n###### Abstract\n\nReal-world machine learning deployments are characterized by mismatches between the source (training) and target (test) distributions that may cause performance drops. In this work, we investigate methods for predicting the target domain accuracy using only labeled source data and unlabeled target data. We propose Average Thresholded Confidence (ATC), a practical method that learns a threshold on the model’s confidence, predicting accuracy as the fraction of unlabeled examples for which model confidence exceeds that threshold. ATC outperforms previous methods across several model architectures, types of distribution shifts (e.g., due to synthetic corruptions, dataset reproduction, or novel subpopulations), and datasets (Wilds, ImageNet, Breeds, CIFAR, and MNIST). In our experiments, ATC estimates target performance $2$–$4\\times$ more accurately than prior methods. We also explore the theoretical foundations of the problem, proving that, in general, identifying the accuracy is just as hard as identifying the optimal predictor and thus, the efficacy of any method rests upon (perhaps unstated) assumptions on the nature of the shift. Finally, analyzing our method on some toy distributions, we provide insights concerning when it works.\n\n## 1 Introduction\n\nMachine learning models deployed in the real world typically encounter examples from previously unseen distributions. While the IID assumption enables us to evaluate models using held-out data from the source distribution (from which training data is sampled), this estimate is no longer valid in presence of a distribution shift. Moreover, under such shifts, model accuracy tends to degrade *(Szegedy et al., 2014; Recht et al., 2019; Koh et al., 2021)*. Commonly, the only data available to the practitioner are a labeled training set (source) and unlabeled deployment-time data which makes the problem more difficult. In this setting, detecting shifts in the distribution of covariates is known to be possible (but difficult) in theory *(Ramdas et al., 2015)*, and in practice *(Rabanser et al., 2018)*. However, producing an optimal predictor using only labeled source and unlabeled target data is well-known to be impossible absent further assumptions *(Ben-David et al., 2010; Lipton et al., 2018)*.\n\nTwo vital questions that remain are: (i) the precise conditions under which we can estimate a classifier’s target-domain accuracy; and (ii) which methods are most practically useful. To begin, the straightforward way to assess the performance of a model under distribution shift would be to collect labeled (target domain) examples and then to evaluate the model on that data. However, collecting fresh labeled data from the target distribution is prohibitively expensive and time-consuming, especially if the target distribution is non-stationary. Hence, instead of using labeled data, we aim to use unlabeled data from the target distribution, that is comparatively abundant, to predict model performance. Note that in this work, our focus is not to improve performance on the target but, rather, to estimate the accuracy on the target for a given classifier.",
      "images": [],
      "tables": [],
      "hyperlinks": [
        "mailto:sgarg2%40andrew.cmu.edu",
        "mailto:sbalakri%40andrew.cmu.edu",
        "mailto:zlipton%40andrew.cmu.edu",
        "mailto:neyshabur%40google.com",
        "mailto:hsedghi%40google.com",
        "https://github.com/saurabhgarg1996/ATC_code"
      ],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 1,
      "markdown": "Published as a conference paper at ICLR 2022\n\n![img-0.jpeg](img-0.jpeg)\nFigure 1: Illustration of our proposed method ATC. Left: using source domain validation data, we identify a threshold on a score (e.g. negative entropy) computed on model confidence such that fraction of examples above the threshold matches the validation set accuracy. ATC estimates accuracy on unlabeled target data as the fraction of examples with the score above the threshold. Interestingly, this threshold yields accurate estimates on a wide set of target distributions resulting from natural and synthetic shifts. Right: Efficacy of ATC over previously proposed approaches on our testbed with a post-hoc calibrated model. To obtain errors on the same scale, we rescale all errors with Average Confidence (AC) error. Lower estimation error is better. See Table 1 for exact numbers and comparison on various types of distribution shift. See Sec. 5 for details on our testbed.\n\n![img-1.jpeg](img-1.jpeg)\n\nRecently, numerous methods have been proposed for this purpose (Deng &amp; Zheng, 2021; Chen et al., 2021b; Jiang et al., 2021; Deng et al., 2021; Guillory et al., 2021). These methods either require calibration on the target domain to yield consistent estimates (Jiang et al., 2021; Guillory et al., 2021) or additional labeled data from several target domains to learn a linear regression function on a distributional distance that then predicts model performance (Deng et al., 2021; Deng &amp; Zheng, 2021; Guillory et al., 2021). However, methods that require calibration on the target domain typically yield poor estimates since deep models trained and calibrated on source data are not, in general, calibrated on a (previously unseen) target domain (Ovadia et al., 2019). Besides, methods that leverage labeled data from target domains rely on the fact that unseen target domains exhibit strong linear correlation with seen target domains on the underlying distance measure and, hence, can be rendered ineffective when such target domains with labeled data are unavailable (in Sec. 5.1 we demonstrate such a failure on a real-world distribution shift problem). Therefore, throughout the paper, we assume access to labeled source data and only unlabeled data from target domain(s).\n\nIn this work, we first show that absent assumptions on the source classifier or the nature of the shift, no method of estimating accuracy will work generally (even in non-contrived settings). To estimate accuracy on target domain perfectly, we highlight that even given perfect knowledge of the labeled source distribution (i.e.,  $p_{s}(x,y)$ ) and unlabeled target distribution (i.e.,  $p_{t}(x)$ ), we need restrictions on the nature of the shift such that we can uniquely identify the target conditional  $p_{t}(y|x)$ . Thus, in general, identifying the accuracy of the classifier is as hard as identifying the optimal predictor.\n\nSecond, motivated by the superiority of methods that use maximum softmax probability (or logit) of a model for Out-Of-Distribution (OOD) detection (Hendrycks &amp; Gimpel, 2016; Hendrycks et al., 2019), we propose a simple method that leverages softmax probability to predict model performance. Our method, Average Thresholded Confidence (ATC), learns a threshold on a score (e.g., maximum confidence or negative entropy) of model confidence on validation source data and predicts target domain accuracy as the fraction of unlabeled target points that receive a score above that threshold. ATC selects a threshold on validation source data such that the fraction of source examples that receive the score above the threshold match the accuracy of those examples. Our primary contribution in ATC is the proposal of obtaining the threshold and observing its efficacy on (practical) accuracy estimation. Importantly, our work takes a step forward in positively answering the question raised in Deng &amp; Zheng (2021); Deng et al. (2021) about a practical strategy to select a threshold that enables accuracy prediction with thresholded model confidence.",
      "images": [
        {
          "id": "img-0.jpeg",
          "top_left_x": 294,
          "top_left_y": 222,
          "bottom_right_x": 943,
          "bottom_right_y": 635,
          "image_base64": "data:image/jpeg;base64,...",
          "image_annotation": null
        }
      ],
      "tables": [],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 27,
      "markdown": "Published as a conference paper at ICLR 2022\n\n[tbl-3.html](tbl-3.html)\n\nTable 3: Mean Absolute estimation Error (MAE) results for different datasets in our setup grouped by the nature of shift. 'Same' refers to same subpopulation shifts and 'Novel' refers novel subpopulation shifts. We include details about the target sets considered in each shift in Table 2. Post T denotes use of TS calibration on source. For language datasets, we use DistilBERT-base-uncased, for vision dataset we report results with DenseNet model with the exception of MNIST where we use FCN. Across all datasets, we observe that ATC achieves superior performance (lower MAE is better). For GDE post T and pre T estimates match since TS doesn't alter the argmax prediction. Results reported by aggregating MAE numbers over 4 different seeds. Values in parenthesis (i.e.,  $(\\cdot)$ ) denote standard deviation values.",
      "images": [],
      "tables": [
        {
          "id": "tbl-3.html",
          "content": "<table><tr><td rowspan=\"2\">Dataset</td><td rowspan=\"2\">Shift</td><td colspan=\"2\">IM</td><td colspan=\"2\">AC</td><td colspan=\"2\">DOC</td><td>GDE</td><td colspan=\"2\">ATC-MC (Ours)</td><td colspan=\"2\">ATC-NE (Ours)</td></tr><tr><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td></tr><tr><td rowspan=\"4\">CIFAR10</td><td rowspan=\"2\">Natural</td><td>6.60</td><td>5.74</td><td>9.88</td><td>6.89</td><td>7.25</td><td>6.07</td><td>4.77</td><td>3.21</td><td>3.02</td><td>2.99</td><td>2.85</td></tr><tr><td>(0.35)</td><td>(0.30)</td><td>(0.16)</td><td>(0.13)</td><td>(0.15)</td><td>(0.16)</td><td>(0.13)</td><td>(0.49)</td><td>(0.40)</td><td>(0.37)</td><td>(0.29)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>12.33</td><td>10.20</td><td>16.50</td><td>11.91</td><td>13.87</td><td>11.08</td><td>6.55</td><td>4.65</td><td>4.25</td><td>4.21</td><td>3.87</td></tr><tr><td>(0.51)</td><td>(0.48)</td><td>(0.26)</td><td>(0.17)</td><td>(0.18)</td><td>(0.17)</td><td>(0.35)</td><td>(0.55)</td><td>(0.55)</td><td>(0.55)</td><td>(0.75)</td></tr><tr><td rowspan=\"2\">CIFAR100</td><td rowspan=\"2\">Synthetic</td><td>13.69</td><td>11.51</td><td>23.61</td><td>13.10</td><td>14.60</td><td>10.14</td><td>9.85</td><td>5.50</td><td>4.75</td><td>4.72</td><td>4.94</td></tr><tr><td>(0.55)</td><td>(0.41)</td><td>(1.16)</td><td>(0.80)</td><td>(0.77)</td><td>(0.64)</td><td>(0.57)</td><td>(0.70)</td><td>(0.73)</td><td>(0.74)</td><td>(0.74)</td></tr><tr><td rowspan=\"4\">ImageNet200</td><td rowspan=\"2\">Natural</td><td>12.37</td><td>8.19</td><td>22.07</td><td>8.61</td><td>15.17</td><td>7.81</td><td>5.13</td><td>4.37</td><td>2.04</td><td>3.79</td><td>1.45</td></tr><tr><td>(0.25)</td><td>(0.33)</td><td>(0.08)</td><td>(0.25)</td><td>(0.11)</td><td>(0.29)</td><td>(0.08)</td><td>(0.39)</td><td>(0.24)</td><td>(0.30)</td><td>(0.27)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>19.86</td><td>12.94</td><td>32.44</td><td>13.35</td><td>25.02</td><td>12.38</td><td>5.41</td><td>5.93</td><td>3.09</td><td>5.00</td><td>2.68</td></tr><tr><td>(1.38)</td><td>(1.81)</td><td>(1.00)</td><td>(1.30)</td><td>(1.10)</td><td>(1.38)</td><td>(0.89)</td><td>(1.38)</td><td>(0.87)</td><td>(1.28)</td><td>(0.45)</td></tr><tr><td rowspan=\"4\">ImageNet</td><td rowspan=\"2\">Natural</td><td>7.77</td><td>6.50</td><td>18.13</td><td>6.02</td><td>8.13</td><td>5.76</td><td>6.23</td><td>3.88</td><td>2.17</td><td>2.06</td><td>0.80</td></tr><tr><td>(0.27)</td><td>(0.33)</td><td>(0.23)</td><td>(0.34)</td><td>(0.27)</td><td>(0.37)</td><td>(0.41)</td><td>(0.53)</td><td>(0.62)</td><td>(0.54)</td><td>(0.44)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>13.39</td><td>10.12</td><td>24.62</td><td>8.51</td><td>13.55</td><td>7.90</td><td>6.32</td><td>3.34</td><td>2.53</td><td>2.61</td><td>4.89</td></tr><tr><td>(0.53)</td><td>(0.63)</td><td>(0.64)</td><td>(0.71)</td><td>(0.61)</td><td>(0.72)</td><td>(0.33)</td><td>(0.53)</td><td>(0.36)</td><td>(0.33)</td><td>(0.83)</td></tr><tr><td rowspan=\"2\">FMoW-WILDS</td><td rowspan=\"2\">Natural</td><td>5.53</td><td>4.31</td><td>33.53</td><td>12.84</td><td>5.94</td><td>4.45</td><td>5.74</td><td>3.06</td><td>2.70</td><td>3.02</td><td>2.72</td></tr><tr><td>(0.33)</td><td>(0.63)</td><td>(0.13)</td><td>(12.06)</td><td>(0.36)</td><td>(0.77)</td><td>(0.55)</td><td>(0.36)</td><td>(0.54)</td><td>(0.35)</td><td>(0.44)</td></tr><tr><td rowspan=\"2\">RxRx1-WILDS</td><td rowspan=\"2\">Natural</td><td>5.80</td><td>5.72</td><td>7.90</td><td>4.84</td><td>5.98</td><td>5.98</td><td>6.03</td><td>4.66</td><td>4.56</td><td>4.41</td><td>4.47</td></tr><tr><td>(0.17)</td><td>(0.15)</td><td>(0.24)</td><td>(0.09)</td><td>(0.15)</td><td>(0.13)</td><td>(0.08)</td><td>(0.38)</td><td>(0.38)</td><td>(0.31)</td><td>(0.26)</td></tr><tr><td rowspan=\"2\">Amazon-WILDS</td><td rowspan=\"2\">Natural</td><td>2.40</td><td>2.29</td><td>8.01</td><td>2.38</td><td>2.40</td><td>2.28</td><td>17.87</td><td>1.65</td><td>1.62</td><td>1.60</td><td>1.59</td></tr><tr><td>(0.08)</td><td>(0.09)</td><td>(0.53)</td><td>(0.17)</td><td>(0.09)</td><td>(0.09)</td><td>(0.18)</td><td>(0.06)</td><td>(0.05)</td><td>(0.14)</td><td>(0.15)</td></tr><tr><td rowspan=\"2\">CivilCom.-WILDS</td><td rowspan=\"2\">Natural</td><td>12.64</td><td>10.80</td><td>16.76</td><td>11.03</td><td>13.31</td><td>10.99</td><td>16.65</td><td></td><td>7.14</td><td></td><td></td></tr><tr><td>(0.52)</td><td>(0.48)</td><td>(0.53)</td><td>(0.49)</td><td>(0.52)</td><td>(0.49)</td><td>(0.25)</td><td></td><td>(0.41)</td><td></td><td></td></tr><tr><td rowspan=\"2\">MNIST</td><td rowspan=\"2\">Natural</td><td>18.48</td><td>15.99</td><td>21.17</td><td>14.81</td><td>20.19</td><td>14.56</td><td>24.42</td><td>5.02</td><td>2.40</td><td>3.14</td><td>3.50</td></tr><tr><td>(0.45)</td><td>(1.53)</td><td>(0.24)</td><td>(3.89)</td><td>(0.23)</td><td>(3.47)</td><td>(0.41)</td><td>(0.44)</td><td>(1.83)</td><td>(0.49)</td><td>(0.17)</td></tr><tr><td rowspan=\"4\">ENTITY-13</td><td rowspan=\"2\">Same</td><td>16.23</td><td>11.14</td><td>24.97</td><td>10.88</td><td>19.08</td><td>10.47</td><td>10.71</td><td>5.39</td><td>3.88</td><td>4.58</td><td>4.19</td></tr><tr><td>(0.77)</td><td>(0.65)</td><td>(0.70)</td><td>(0.77)</td><td>(0.65)</td><td>(0.72)</td><td>(0.74)</td><td>(0.92)</td><td>(0.61)</td><td>(0.85)</td><td>(0.16)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.53</td><td>22.02</td><td>38.33</td><td>21.64</td><td>32.43</td><td>21.22</td><td>20.61</td><td>13.58</td><td>10.28</td><td>12.25</td><td>6.63</td></tr><tr><td>(0.82)</td><td>(0.68)</td><td>(0.75)</td><td>(0.86)</td><td>(0.69)</td><td>(0.80)</td><td>(0.60)</td><td>(1.15)</td><td>(1.34)</td><td>(1.21)</td><td>(0.93)</td></tr><tr><td rowspan=\"4\">ENTITY-30</td><td rowspan=\"2\">Same</td><td>18.59</td><td>14.46</td><td>28.82</td><td>14.30</td><td>21.63</td><td>13.46</td><td>12.92</td><td>9.12</td><td>7.75</td><td>8.15</td><td>7.64</td></tr><tr><td>(0.51)</td><td>(0.52)</td><td>(0.43)</td><td>(0.71)</td><td>(0.37)</td><td>(0.59)</td><td>(0.14)</td><td>(0.62)</td><td>(0.72)</td><td>(0.68)</td><td>(0.88)</td></tr><tr><td rowspan=\"2\">Novel</td><td>32.34</td><td>26.85</td><td>44.02</td><td>26.27</td><td>36.82</td><td>25.42</td><td>23.16</td><td>17.75</td><td>14.30</td><td>15.60</td><td>10.57</td></tr><tr><td>(0.60)</td><td>(0.58)</td><td>(0.56)</td><td>(0.79)</td><td>(0.47)</td><td>(0.68)</td><td>(0.12)</td><td>(0.76)</td><td>(0.85)</td><td>(0.86)</td><td>(0.86)</td></tr><tr><td rowspan=\"4\">NONLIVING-26</td><td rowspan=\"2\">Same</td><td>18.66</td><td>17.17</td><td>26.39</td><td>16.14</td><td>19.86</td><td>15.58</td><td>16.63</td><td>10.87</td><td>10.24</td><td>10.07</td><td>10.26</td></tr><tr><td>(0.76)</td><td>(0.74)</td><td>(0.82)</td><td>(0.81)</td><td>(0.67)</td><td>(0.76)</td><td>(0.45)</td><td>(0.98)</td><td>(0.83)</td><td>(0.92)</td><td>(1.18)</td></tr><tr><td rowspan=\"2\">Novel</td><td>33.43</td><td>31.53</td><td>41.66</td><td>29.87</td><td>35.13</td><td>29.31</td><td>29.56</td><td>21.70</td><td>20.12</td><td>19.08</td><td>18.26</td></tr><tr><td>(0.67)</td><td>(0.65)</td><td>(0.67)</td><td>(0.71)</td><td>(0.54)</td><td>(0.64)</td><td>(0.21)</td><td>(0.86)</td><td>(0.75)</td><td>(0.82)</td><td>(1.12)</td></tr><tr><td rowspan=\"4\">LIVING-17</td><td rowspan=\"2\">Same</td><td>12.63</td><td>11.05</td><td>18.32</td><td>10.46</td><td>14.43</td><td>10.14</td><td>9.87</td><td>4.57</td><td>3.95</td><td>3.81</td><td>4.21</td></tr><tr><td>(1.25)</td><td>(1.20)</td><td>(1.01)</td><td>(1.12)</td><td>(1.11)</td><td>(1.16)</td><td>(0.61)</td><td>(0.71)</td><td>(0.48)</td><td>(0.22)</td><td>(0.53)</td></tr><tr><td rowspan=\"2\">Novel</td><td>29.03</td><td>26.96</td><td>35.67</td><td>26.11</td><td>31.73</td><td>25.73</td><td>23.53</td><td>16.15</td><td>14.49</td><td>12.97</td><td>11.39</td></tr><tr><td>(1.44)</td><td>(1.38)</td><td>(1.09)</td><td>(1.27)</td><td>(1.19)</td><td>(1.35)</td><td>(0.52)</td><td>(1.36)</td><td>(1.46)</td><td>(1.52)</td><td>(1.72)</td></tr></table>",
          "format": "html"
        }
      ],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 28,
      "markdown": "Published as a conference paper at ICLR 2022\n\n[tbl-4.html](tbl-4.html)\n\nTable 4: Mean Absolute estimation Error (MAE) results for different datasets in our setup grouped by the nature of shift for ResNet model. 'Same' refers to same subpopulation shifts and 'Novel' refers novel subpopulation shifts. We include details about the target sets considered in each shift in Table 2. Post T denotes use of TS calibration on source. Across all datasets, we observe that ATC achieves superior performance (lower MAE is better). For GDE post T and pre T estimates match since TS doesn't alter the argmax prediction. Results reported by aggregating MAE numbers over 4 different seeds. Values in parenthesis (i.e.,  $(\\cdot)$ ) denote standard deviation values.",
      "images": [],
      "tables": [
        {
          "id": "tbl-4.html",
          "content": "<table><tr><td rowspan=\"2\">Dataset</td><td rowspan=\"2\">Shift</td><td colspan=\"2\">IM</td><td colspan=\"2\">AC</td><td colspan=\"2\">DOC</td><td>GDE</td><td colspan=\"2\">ATC-MC (Ours)</td><td colspan=\"2\">ATC-NE (Ours)</td></tr><tr><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td></tr><tr><td rowspan=\"4\">CIFAR10</td><td rowspan=\"2\">Natural</td><td>7.14</td><td>6.20</td><td>10.25</td><td>7.06</td><td>7.68</td><td>6.35</td><td>5.74</td><td>4.02</td><td>3.85</td><td>3.76</td><td>3.38</td></tr><tr><td>(0.14)</td><td>(0.11)</td><td>(0.31)</td><td>(0.33)</td><td>(0.28)</td><td>(0.27)</td><td>(0.25)</td><td>(0.38)</td><td>(0.30)</td><td>(0.33)</td><td>(0.32)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>12.62</td><td>10.75</td><td>16.50</td><td>11.91</td><td>13.93</td><td>11.20</td><td>7.97</td><td>5.66</td><td>5.03</td><td>4.87</td><td>3.63</td></tr><tr><td>(0.76)</td><td>(0.71)</td><td>(0.28)</td><td>(0.24)</td><td>(0.29)</td><td>(0.28)</td><td>(0.13)</td><td>(0.64)</td><td>(0.71)</td><td>(0.71)</td><td>(0.62)</td></tr><tr><td rowspan=\"2\">CIFAR100</td><td rowspan=\"2\">Synthetic</td><td>12.77</td><td>12.34</td><td>16.89</td><td>12.73</td><td>11.18</td><td>9.63</td><td>12.00</td><td>5.61</td><td>5.55</td><td>5.65</td><td>5.76</td></tr><tr><td>(0.43)</td><td>(0.68)</td><td>(0.20)</td><td>(2.59)</td><td>(0.35)</td><td>(1.25)</td><td>(0.48)</td><td>(0.51)</td><td>(0.55)</td><td>(0.35)</td><td>(0.27)</td></tr><tr><td rowspan=\"4\">ImageNet200</td><td rowspan=\"2\">Natural</td><td>12.63</td><td>7.99</td><td>23.08</td><td>7.22</td><td>15.40</td><td>6.33</td><td>5.00</td><td>4.60</td><td>1.80</td><td>4.06</td><td>1.38</td></tr><tr><td>(0.59)</td><td>(0.47)</td><td>(0.31)</td><td>(0.22)</td><td>(0.42)</td><td>(0.24)</td><td>(0.36)</td><td>(0.63)</td><td>(0.17)</td><td>(0.69)</td><td>(0.29)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>20.17</td><td>11.74</td><td>33.69</td><td>9.51</td><td>25.49</td><td>8.61</td><td>4.19</td><td>5.37</td><td>2.78</td><td>4.53</td><td>3.58</td></tr><tr><td>(0.74)</td><td>(0.80)</td><td>(0.73)</td><td>(0.51)</td><td>(0.66)</td><td>(0.50)</td><td>(0.14)</td><td>(0.88)</td><td>(0.23)</td><td>(0.79)</td><td>(0.33)</td></tr><tr><td rowspan=\"4\">ImageNet</td><td rowspan=\"2\">Natural</td><td>8.09</td><td>6.42</td><td>21.66</td><td>5.91</td><td>8.53</td><td>5.21</td><td>5.90</td><td>3.93</td><td>1.89</td><td>2.45</td><td>0.73</td></tr><tr><td>(0.25)</td><td>(0.28)</td><td>(0.38)</td><td>(0.22)</td><td>(0.26)</td><td>(0.25)</td><td>(0.44)</td><td>(0.26)</td><td>(0.21)</td><td>(0.16)</td><td>(0.10)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>13.93</td><td>9.90</td><td>28.05</td><td>7.56</td><td>13.82</td><td>6.19</td><td>6.70</td><td>3.33</td><td>2.55</td><td>2.12</td><td>5.06</td></tr><tr><td>(0.14)</td><td>(0.23)</td><td>(0.39)</td><td>(0.13)</td><td>(0.31)</td><td>(0.07)</td><td>(0.52)</td><td>(0.25)</td><td>(0.25)</td><td>(0.31)</td><td>(0.27)</td></tr><tr><td rowspan=\"2\">FMoW-WILDS</td><td rowspan=\"2\">Natural</td><td>5.15</td><td>3.55</td><td>34.64</td><td>5.03</td><td>5.58</td><td>3.46</td><td>5.08</td><td>2.59</td><td>2.33</td><td>2.52</td><td>2.22</td></tr><tr><td>(0.19)</td><td>(0.41)</td><td>(0.22)</td><td>(0.29)</td><td>(0.17)</td><td>(0.37)</td><td>(0.46)</td><td>(0.32)</td><td>(0.28)</td><td>(0.25)</td><td>(0.30)</td></tr><tr><td rowspan=\"2\">RxRx1-WILDS</td><td rowspan=\"2\">Natural</td><td>6.17</td><td>6.11</td><td>21.05</td><td>5.21</td><td>6.54</td><td>6.27</td><td>6.82</td><td>5.30</td><td>5.20</td><td>5.19</td><td>5.63</td></tr><tr><td>(0.20)</td><td>(0.24)</td><td>(0.31)</td><td>(0.18)</td><td>(0.21)</td><td>(0.20)</td><td>(0.31)</td><td>(0.30)</td><td>(0.44)</td><td>(0.43)</td><td>(0.55)</td></tr><tr><td rowspan=\"4\">ENTITY-13</td><td rowspan=\"2\">Same</td><td>18.32</td><td>14.38</td><td>27.79</td><td>13.56</td><td>20.50</td><td>13.22</td><td>16.09</td><td>9.35</td><td>7.50</td><td>7.80</td><td>6.94</td></tr><tr><td>(0.29)</td><td>(0.53)</td><td>(1.18)</td><td>(0.58)</td><td>(0.47)</td><td>(0.58)</td><td>(0.84)</td><td>(0.79)</td><td>(0.65)</td><td>(0.62)</td><td>(0.71)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.82</td><td>24.03</td><td>38.97</td><td>22.96</td><td>31.66</td><td>22.61</td><td>25.26</td><td>17.11</td><td>13.96</td><td>14.75</td><td>9.94</td></tr><tr><td>(0.30)</td><td>(0.55)</td><td>(1.32)</td><td>(0.59)</td><td>(0.54)</td><td>(0.58)</td><td>(1.08)</td><td>(0.84)</td><td>(0.93)</td><td>(0.64)</td><td>(0.78)</td></tr><tr><td rowspan=\"4\">ENTITY-30</td><td rowspan=\"2\">Same</td><td>16.91</td><td>14.61</td><td>26.84</td><td>14.37</td><td>18.60</td><td>13.11</td><td>13.74</td><td>8.54</td><td>7.94</td><td>7.77</td><td>8.04</td></tr><tr><td>(1.33)</td><td>(1.11)</td><td>(2.15)</td><td>(1.34)</td><td>(1.69)</td><td>(1.30)</td><td>(1.07)</td><td>(1.47)</td><td>(1.38)</td><td>(1.44)</td><td>(1.51)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.66</td><td>25.83</td><td>39.21</td><td>25.03</td><td>30.95</td><td>23.73</td><td>23.15</td><td>15.57</td><td>13.24</td><td>12.44</td><td>11.05</td></tr><tr><td>(1.16)</td><td>(0.88)</td><td>(2.03)</td><td>(1.11)</td><td>(1.64)</td><td>(1.11)</td><td>(0.51)</td><td>(1.44)</td><td>(1.15)</td><td>(1.26)</td><td>(1.13)</td></tr><tr><td rowspan=\"4\">NONLIVING-26</td><td rowspan=\"2\">Same</td><td>17.43</td><td>15.95</td><td>27.70</td><td>15.40</td><td>18.06</td><td>14.58</td><td>16.99</td><td>10.79</td><td>10.13</td><td>10.05</td><td>10.29</td></tr><tr><td>(0.90)</td><td>(0.86)</td><td>(0.90)</td><td>(0.69)</td><td>(1.00)</td><td>(0.78)</td><td>(1.25)</td><td>(0.62)</td><td>(0.32)</td><td>(0.46)</td><td>(0.79)</td></tr><tr><td rowspan=\"2\">Novel</td><td>29.51</td><td>27.75</td><td>40.02</td><td>26.77</td><td>30.36</td><td>25.93</td><td>27.70</td><td>19.64</td><td>17.75</td><td>16.90</td><td>15.69</td></tr><tr><td>(0.86)</td><td>(0.82)</td><td>(0.76)</td><td>(0.82)</td><td>(0.95)</td><td>(0.80)</td><td>(1.42)</td><td>(0.68)</td><td>(0.53)</td><td>(0.60)</td><td>(0.83)</td></tr><tr><td rowspan=\"4\">LIVING-17</td><td rowspan=\"2\">Same</td><td>14.28</td><td>12.21</td><td>23.46</td><td>11.16</td><td>15.22</td><td>10.78</td><td>10.49</td><td>4.92</td><td>4.23</td><td>4.19</td><td>4.73</td></tr><tr><td>(0.96)</td><td>(0.93)</td><td>(1.16)</td><td>(0.90)</td><td>(0.96)</td><td>(0.99)</td><td>(0.97)</td><td>(0.57)</td><td>(0.42)</td><td>(0.35)</td><td>(0.24)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.91</td><td>26.35</td><td>38.62</td><td>24.91</td><td>30.32</td><td>24.52</td><td>22.49</td><td>15.42</td><td>13.02</td><td>12.29</td><td>10.34</td></tr><tr><td>(0.66)</td><td>(0.73)</td><td>(1.01)</td><td>(0.61)</td><td>(0.59)</td><td>(0.74)</td><td>(0.85)</td><td>(0.59)</td><td>(0.53)</td><td>(0.73)</td><td>(0.62)</td></tr></table>",
          "format": "html"
        }
      ],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    }
  ],
  "model": "mistral-ocr-2512",
  "document_annotation": null,
  "usage_info": {
    "pages_processed": 29,
    "doc_size_bytes": 3002783
  }
}
```

    </TabItem>
</Tabs>
    </ExplorerTab>
    <ExplorerTab value="with-uploaded-pdf" label="OCR with an Uploaded PDF">
        You can also upload a PDF file in our Cloud and get the OCR results from the uploaded PDF by retrieving a signed url.

<SectionTab as="h3" variant="secondary" sectionId="upload-a-file">Upload a File</SectionTab>

First, you will have to upload your PDF file to our cloud, this file will be stored and only accessible via an API key.

<Tabs groupId="code">
  <TabItem value="python" label="python" default>

```python
from mistralai import Mistral
import os

api_key = os.environ["MISTRAL_API_KEY"]

client = Mistral(api_key=api_key)

uploaded_pdf = client.files.upload(
    file={
        "file_name": "2201.04234v3.pdf",
        "content": open("2201.04234v3.pdf", "rb"),
    },
    purpose="ocr"
)  
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

const uploadedFile = fs.readFileSync('2201.04234v3.pdf');
const uploadedPdf = await client.files.upload({
    file: {
        fileName: "2201.04234v3.pdf",
        content: uploadedFile,
    },
    purpose: "ocr"
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/files \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -F purpose="ocr" \
  -F file="@2201.04234v3.pdf"
```

  </TabItem>
  <TabItem value="output" label="output">

```json
{
  "id": "22e2e88f-167d-4f3d-982a-add977a54ec3",
  "object": "file",
  "bytes": 3002783,
  "created_at": 1756464781,
  "filename": "2201.04234v3.pdf",
  "purpose": "ocr",
  "sample_type": "ocr_input",
  "num_lines": 0,
  "mimetype": "application/pdf",
  "source": "upload",
  "signature": "..."
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="retrieve-file">Retrieve File</SectionTab>

Once the file uploaded, you can retrieve it at any point.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
retrieved_file = client.files.retrieve(file_id=uploaded_pdf.id)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript
const retrievedFile = await client.files.retrieve({
    fileId: uploadedPdf.id
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl -X GET "https://api.mistral.ai/v1/files/$id" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer $MISTRAL_API_KEY"
```

  </TabItem>

  <TabItem value="output" label="output">

```json
{
  "id": "22e2e88f-167d-4f3d-982a-add977a54ec3",
  "object": "file",
  "bytes": 3002783,
  "created_at": 1756464781,
  "filename": "2201.04234v3.pdf",
  "purpose": "ocr",
  "sample_type": "ocr_input",
  "num_lines": 0,
  "mimetype": "application/pdf",
  "source": "upload",
  "signature": "...",
  "deleted": false
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="get-signed-url">Get Signed Url</SectionTab>

For OCR tasks, you can get a signed url to access the file. An optional `expiry` parameter allow you to automatically expire the signed url after n hours.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
signed_url = client.files.get_signed_url(file_id=uploaded_pdf.id)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript
const signedUrl = await client.files.getSignedUrl({
    fileId: uploadedPdf.id,
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl -X GET "https://api.mistral.ai/v1/files/$id/url?expiry=24" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer $MISTRAL_API_KEY"
```

  </TabItem>

  <TabItem value="output" label="output">

```json
{
  "url": "https://mistralaifilesapiprodswe.blob.core.windows.net/fine-tune/.../.../22e2e88f167d4f3d982aadd977a54ec3.pdf?se=2025-08-30T10%3A53%3A22Z&sp=r&sv=2025-01-05&sr=b&sig=..."
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="get-ocr-results">Get OCR Results</SectionTab>

You can now query the OCR endpoint with the signed url.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
ocr_response = client.ocr.process(
    model="mistral-ocr-latest",
    document={
        "type": "document_url",
        "document_url": signed_url.url,
    },
    table_format="html", # default is None
    # extract_header=True, # default is False
    # extract_footer=True, # default is False
    include_image_base64=True
)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript
const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
        type: "document_url",
        documentUrl: signedUrl.url,
    },
    tableFormat: "html", // default is null
    // extractHeader: False, // default is False
    // extractFooter: False, // default is False
    includeImageBase64: true
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/ocr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
  -d '{
    "model": "mistral-ocr-latest",
    "document": {
        "type": "document_url",
        "document_url": "<signed_url>"
    },
    "table_format": "html",
    "include_image_base64": true
  }' -o ocr_output.json
```

    </TabItem>
    <TabItem value="output" label="output">

```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "# Leveraging Unlabeled Data to Predict Out-of-Distribution Performance\n\nSaurabh Garg\nCarnegie Mellon University\nsgarg2@andrew.cmu.edu\n&Sivaraman Balakrishnan\nCarnegie Mellon University\nsbalakri@andrew.cmu.edu\n&Zachary C. Lipton\nCarnegie Mellon University\nzlipton@andrew.cmu.edu\n&Behnam Neyshabur\nGoogle Research, Blueshift team\nneyshabur@google.com\n&Hanie Sedghi\nGoogle Research, Brain team\nhsedghi@google.com\n\n###### Abstract\n\nReal-world machine learning deployments are characterized by mismatches between the source (training) and target (test) distributions that may cause performance drops. In this work, we investigate methods for predicting the target domain accuracy using only labeled source data and unlabeled target data. We propose Average Thresholded Confidence (ATC), a practical method that learns a threshold on the model’s confidence, predicting accuracy as the fraction of unlabeled examples for which model confidence exceeds that threshold. ATC outperforms previous methods across several model architectures, types of distribution shifts (e.g., due to synthetic corruptions, dataset reproduction, or novel subpopulations), and datasets (Wilds, ImageNet, Breeds, CIFAR, and MNIST). In our experiments, ATC estimates target performance $2$–$4\\times$ more accurately than prior methods. We also explore the theoretical foundations of the problem, proving that, in general, identifying the accuracy is just as hard as identifying the optimal predictor and thus, the efficacy of any method rests upon (perhaps unstated) assumptions on the nature of the shift. Finally, analyzing our method on some toy distributions, we provide insights concerning when it works.\n\n## 1 Introduction\n\nMachine learning models deployed in the real world typically encounter examples from previously unseen distributions. While the IID assumption enables us to evaluate models using held-out data from the source distribution (from which training data is sampled), this estimate is no longer valid in presence of a distribution shift. Moreover, under such shifts, model accuracy tends to degrade *(Szegedy et al., 2014; Recht et al., 2019; Koh et al., 2021)*. Commonly, the only data available to the practitioner are a labeled training set (source) and unlabeled deployment-time data which makes the problem more difficult. In this setting, detecting shifts in the distribution of covariates is known to be possible (but difficult) in theory *(Ramdas et al., 2015)*, and in practice *(Rabanser et al., 2018)*. However, producing an optimal predictor using only labeled source and unlabeled target data is well-known to be impossible absent further assumptions *(Ben-David et al., 2010; Lipton et al., 2018)*.\n\nTwo vital questions that remain are: (i) the precise conditions under which we can estimate a classifier’s target-domain accuracy; and (ii) which methods are most practically useful. To begin, the straightforward way to assess the performance of a model under distribution shift would be to collect labeled (target domain) examples and then to evaluate the model on that data. However, collecting fresh labeled data from the target distribution is prohibitively expensive and time-consuming, especially if the target distribution is non-stationary. Hence, instead of using labeled data, we aim to use unlabeled data from the target distribution, that is comparatively abundant, to predict model performance. Note that in this work, our focus is not to improve performance on the target but, rather, to estimate the accuracy on the target for a given classifier.",
      "images": [],
      "tables": [],
      "hyperlinks": [
        "mailto:sgarg2%40andrew.cmu.edu",
        "mailto:sbalakri%40andrew.cmu.edu",
        "mailto:zlipton%40andrew.cmu.edu",
        "mailto:neyshabur%40google.com",
        "mailto:hsedghi%40google.com",
        "https://github.com/saurabhgarg1996/ATC_code"
      ],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 1,
      "markdown": "Published as a conference paper at ICLR 2022\n\n![img-0.jpeg](img-0.jpeg)\nFigure 1: Illustration of our proposed method ATC. Left: using source domain validation data, we identify a threshold on a score (e.g. negative entropy) computed on model confidence such that fraction of examples above the threshold matches the validation set accuracy. ATC estimates accuracy on unlabeled target data as the fraction of examples with the score above the threshold. Interestingly, this threshold yields accurate estimates on a wide set of target distributions resulting from natural and synthetic shifts. Right: Efficacy of ATC over previously proposed approaches on our testbed with a post-hoc calibrated model. To obtain errors on the same scale, we rescale all errors with Average Confidence (AC) error. Lower estimation error is better. See Table 1 for exact numbers and comparison on various types of distribution shift. See Sec. 5 for details on our testbed.\n\n![img-1.jpeg](img-1.jpeg)\n\nRecently, numerous methods have been proposed for this purpose (Deng &amp; Zheng, 2021; Chen et al., 2021b; Jiang et al., 2021; Deng et al., 2021; Guillory et al., 2021). These methods either require calibration on the target domain to yield consistent estimates (Jiang et al., 2021; Guillory et al., 2021) or additional labeled data from several target domains to learn a linear regression function on a distributional distance that then predicts model performance (Deng et al., 2021; Deng &amp; Zheng, 2021; Guillory et al., 2021). However, methods that require calibration on the target domain typically yield poor estimates since deep models trained and calibrated on source data are not, in general, calibrated on a (previously unseen) target domain (Ovadia et al., 2019). Besides, methods that leverage labeled data from target domains rely on the fact that unseen target domains exhibit strong linear correlation with seen target domains on the underlying distance measure and, hence, can be rendered ineffective when such target domains with labeled data are unavailable (in Sec. 5.1 we demonstrate such a failure on a real-world distribution shift problem). Therefore, throughout the paper, we assume access to labeled source data and only unlabeled data from target domain(s).\n\nIn this work, we first show that absent assumptions on the source classifier or the nature of the shift, no method of estimating accuracy will work generally (even in non-contrived settings). To estimate accuracy on target domain perfectly, we highlight that even given perfect knowledge of the labeled source distribution (i.e.,  $p_{s}(x,y)$ ) and unlabeled target distribution (i.e.,  $p_{t}(x)$ ), we need restrictions on the nature of the shift such that we can uniquely identify the target conditional  $p_{t}(y|x)$ . Thus, in general, identifying the accuracy of the classifier is as hard as identifying the optimal predictor.\n\nSecond, motivated by the superiority of methods that use maximum softmax probability (or logit) of a model for Out-Of-Distribution (OOD) detection (Hendrycks &amp; Gimpel, 2016; Hendrycks et al., 2019), we propose a simple method that leverages softmax probability to predict model performance. Our method, Average Thresholded Confidence (ATC), learns a threshold on a score (e.g., maximum confidence or negative entropy) of model confidence on validation source data and predicts target domain accuracy as the fraction of unlabeled target points that receive a score above that threshold. ATC selects a threshold on validation source data such that the fraction of source examples that receive the score above the threshold match the accuracy of those examples. Our primary contribution in ATC is the proposal of obtaining the threshold and observing its efficacy on (practical) accuracy estimation. Importantly, our work takes a step forward in positively answering the question raised in Deng &amp; Zheng (2021); Deng et al. (2021) about a practical strategy to select a threshold that enables accuracy prediction with thresholded model confidence.",
      "images": [
        {
          "id": "img-0.jpeg",
          "top_left_x": 294,
          "top_left_y": 222,
          "bottom_right_x": 943,
          "bottom_right_y": 635,
          "image_base64": "data:image/jpeg;base64,...",
          "image_annotation": null
        }
      ],
      "tables": [],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 27,
      "markdown": "Published as a conference paper at ICLR 2022\n\n[tbl-3.html](tbl-3.html)\n\nTable 3: Mean Absolute estimation Error (MAE) results for different datasets in our setup grouped by the nature of shift. 'Same' refers to same subpopulation shifts and 'Novel' refers novel subpopulation shifts. We include details about the target sets considered in each shift in Table 2. Post T denotes use of TS calibration on source. For language datasets, we use DistilBERT-base-uncased, for vision dataset we report results with DenseNet model with the exception of MNIST where we use FCN. Across all datasets, we observe that ATC achieves superior performance (lower MAE is better). For GDE post T and pre T estimates match since TS doesn't alter the argmax prediction. Results reported by aggregating MAE numbers over 4 different seeds. Values in parenthesis (i.e.,  $(\\cdot)$ ) denote standard deviation values.",
      "images": [],
      "tables": [
        {
          "id": "tbl-3.html",
          "content": "<table><tr><td rowspan=\"2\">Dataset</td><td rowspan=\"2\">Shift</td><td colspan=\"2\">IM</td><td colspan=\"2\">AC</td><td colspan=\"2\">DOC</td><td>GDE</td><td colspan=\"2\">ATC-MC (Ours)</td><td colspan=\"2\">ATC-NE (Ours)</td></tr><tr><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td></tr><tr><td rowspan=\"4\">CIFAR10</td><td rowspan=\"2\">Natural</td><td>6.60</td><td>5.74</td><td>9.88</td><td>6.89</td><td>7.25</td><td>6.07</td><td>4.77</td><td>3.21</td><td>3.02</td><td>2.99</td><td>2.85</td></tr><tr><td>(0.35)</td><td>(0.30)</td><td>(0.16)</td><td>(0.13)</td><td>(0.15)</td><td>(0.16)</td><td>(0.13)</td><td>(0.49)</td><td>(0.40)</td><td>(0.37)</td><td>(0.29)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>12.33</td><td>10.20</td><td>16.50</td><td>11.91</td><td>13.87</td><td>11.08</td><td>6.55</td><td>4.65</td><td>4.25</td><td>4.21</td><td>3.87</td></tr><tr><td>(0.51)</td><td>(0.48)</td><td>(0.26)</td><td>(0.17)</td><td>(0.18)</td><td>(0.17)</td><td>(0.35)</td><td>(0.55)</td><td>(0.55)</td><td>(0.55)</td><td>(0.75)</td></tr><tr><td rowspan=\"2\">CIFAR100</td><td rowspan=\"2\">Synthetic</td><td>13.69</td><td>11.51</td><td>23.61</td><td>13.10</td><td>14.60</td><td>10.14</td><td>9.85</td><td>5.50</td><td>4.75</td><td>4.72</td><td>4.94</td></tr><tr><td>(0.55)</td><td>(0.41)</td><td>(1.16)</td><td>(0.80)</td><td>(0.77)</td><td>(0.64)</td><td>(0.57)</td><td>(0.70)</td><td>(0.73)</td><td>(0.74)</td><td>(0.74)</td></tr><tr><td rowspan=\"4\">ImageNet200</td><td rowspan=\"2\">Natural</td><td>12.37</td><td>8.19</td><td>22.07</td><td>8.61</td><td>15.17</td><td>7.81</td><td>5.13</td><td>4.37</td><td>2.04</td><td>3.79</td><td>1.45</td></tr><tr><td>(0.25)</td><td>(0.33)</td><td>(0.08)</td><td>(0.25)</td><td>(0.11)</td><td>(0.29)</td><td>(0.08)</td><td>(0.39)</td><td>(0.24)</td><td>(0.30)</td><td>(0.27)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>19.86</td><td>12.94</td><td>32.44</td><td>13.35</td><td>25.02</td><td>12.38</td><td>5.41</td><td>5.93</td><td>3.09</td><td>5.00</td><td>2.68</td></tr><tr><td>(1.38)</td><td>(1.81)</td><td>(1.00)</td><td>(1.30)</td><td>(1.10)</td><td>(1.38)</td><td>(0.89)</td><td>(1.38)</td><td>(0.87)</td><td>(1.28)</td><td>(0.45)</td></tr><tr><td rowspan=\"4\">ImageNet</td><td rowspan=\"2\">Natural</td><td>7.77</td><td>6.50</td><td>18.13</td><td>6.02</td><td>8.13</td><td>5.76</td><td>6.23</td><td>3.88</td><td>2.17</td><td>2.06</td><td>0.80</td></tr><tr><td>(0.27)</td><td>(0.33)</td><td>(0.23)</td><td>(0.34)</td><td>(0.27)</td><td>(0.37)</td><td>(0.41)</td><td>(0.53)</td><td>(0.62)</td><td>(0.54)</td><td>(0.44)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>13.39</td><td>10.12</td><td>24.62</td><td>8.51</td><td>13.55</td><td>7.90</td><td>6.32</td><td>3.34</td><td>2.53</td><td>2.61</td><td>4.89</td></tr><tr><td>(0.53)</td><td>(0.63)</td><td>(0.64)</td><td>(0.71)</td><td>(0.61)</td><td>(0.72)</td><td>(0.33)</td><td>(0.53)</td><td>(0.36)</td><td>(0.33)</td><td>(0.83)</td></tr><tr><td rowspan=\"2\">FMoW-WILDS</td><td rowspan=\"2\">Natural</td><td>5.53</td><td>4.31</td><td>33.53</td><td>12.84</td><td>5.94</td><td>4.45</td><td>5.74</td><td>3.06</td><td>2.70</td><td>3.02</td><td>2.72</td></tr><tr><td>(0.33)</td><td>(0.63)</td><td>(0.13)</td><td>(12.06)</td><td>(0.36)</td><td>(0.77)</td><td>(0.55)</td><td>(0.36)</td><td>(0.54)</td><td>(0.35)</td><td>(0.44)</td></tr><tr><td rowspan=\"2\">RxRx1-WILDS</td><td rowspan=\"2\">Natural</td><td>5.80</td><td>5.72</td><td>7.90</td><td>4.84</td><td>5.98</td><td>5.98</td><td>6.03</td><td>4.66</td><td>4.56</td><td>4.41</td><td>4.47</td></tr><tr><td>(0.17)</td><td>(0.15)</td><td>(0.24)</td><td>(0.09)</td><td>(0.15)</td><td>(0.13)</td><td>(0.08)</td><td>(0.38)</td><td>(0.38)</td><td>(0.31)</td><td>(0.26)</td></tr><tr><td rowspan=\"2\">Amazon-WILDS</td><td rowspan=\"2\">Natural</td><td>2.40</td><td>2.29</td><td>8.01</td><td>2.38</td><td>2.40</td><td>2.28</td><td>17.87</td><td>1.65</td><td>1.62</td><td>1.60</td><td>1.59</td></tr><tr><td>(0.08)</td><td>(0.09)</td><td>(0.53)</td><td>(0.17)</td><td>(0.09)</td><td>(0.09)</td><td>(0.18)</td><td>(0.06)</td><td>(0.05)</td><td>(0.14)</td><td>(0.15)</td></tr><tr><td rowspan=\"2\">CivilCom.-WILDS</td><td rowspan=\"2\">Natural</td><td>12.64</td><td>10.80</td><td>16.76</td><td>11.03</td><td>13.31</td><td>10.99</td><td>16.65</td><td></td><td>7.14</td><td></td><td></td></tr><tr><td>(0.52)</td><td>(0.48)</td><td>(0.53)</td><td>(0.49)</td><td>(0.52)</td><td>(0.49)</td><td>(0.25)</td><td></td><td>(0.41)</td><td></td><td></td></tr><tr><td rowspan=\"2\">MNIST</td><td rowspan=\"2\">Natural</td><td>18.48</td><td>15.99</td><td>21.17</td><td>14.81</td><td>20.19</td><td>14.56</td><td>24.42</td><td>5.02</td><td>2.40</td><td>3.14</td><td>3.50</td></tr><tr><td>(0.45)</td><td>(1.53)</td><td>(0.24)</td><td>(3.89)</td><td>(0.23)</td><td>(3.47)</td><td>(0.41)</td><td>(0.44)</td><td>(1.83)</td><td>(0.49)</td><td>(0.17)</td></tr><tr><td rowspan=\"4\">ENTITY-13</td><td rowspan=\"2\">Same</td><td>16.23</td><td>11.14</td><td>24.97</td><td>10.88</td><td>19.08</td><td>10.47</td><td>10.71</td><td>5.39</td><td>3.88</td><td>4.58</td><td>4.19</td></tr><tr><td>(0.77)</td><td>(0.65)</td><td>(0.70)</td><td>(0.77)</td><td>(0.65)</td><td>(0.72)</td><td>(0.74)</td><td>(0.92)</td><td>(0.61)</td><td>(0.85)</td><td>(0.16)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.53</td><td>22.02</td><td>38.33</td><td>21.64</td><td>32.43</td><td>21.22</td><td>20.61</td><td>13.58</td><td>10.28</td><td>12.25</td><td>6.63</td></tr><tr><td>(0.82)</td><td>(0.68)</td><td>(0.75)</td><td>(0.86)</td><td>(0.69)</td><td>(0.80)</td><td>(0.60)</td><td>(1.15)</td><td>(1.34)</td><td>(1.21)</td><td>(0.93)</td></tr><tr><td rowspan=\"4\">ENTITY-30</td><td rowspan=\"2\">Same</td><td>18.59</td><td>14.46</td><td>28.82</td><td>14.30</td><td>21.63</td><td>13.46</td><td>12.92</td><td>9.12</td><td>7.75</td><td>8.15</td><td>7.64</td></tr><tr><td>(0.51)</td><td>(0.52)</td><td>(0.43)</td><td>(0.71)</td><td>(0.37)</td><td>(0.59)</td><td>(0.14)</td><td>(0.62)</td><td>(0.72)</td><td>(0.68)</td><td>(0.88)</td></tr><tr><td rowspan=\"2\">Novel</td><td>32.34</td><td>26.85</td><td>44.02</td><td>26.27</td><td>36.82</td><td>25.42</td><td>23.16</td><td>17.75</td><td>14.30</td><td>15.60</td><td>10.57</td></tr><tr><td>(0.60)</td><td>(0.58)</td><td>(0.56)</td><td>(0.79)</td><td>(0.47)</td><td>(0.68)</td><td>(0.12)</td><td>(0.76)</td><td>(0.85)</td><td>(0.86)</td><td>(0.86)</td></tr><tr><td rowspan=\"4\">NONLIVING-26</td><td rowspan=\"2\">Same</td><td>18.66</td><td>17.17</td><td>26.39</td><td>16.14</td><td>19.86</td><td>15.58</td><td>16.63</td><td>10.87</td><td>10.24</td><td>10.07</td><td>10.26</td></tr><tr><td>(0.76)</td><td>(0.74)</td><td>(0.82)</td><td>(0.81)</td><td>(0.67)</td><td>(0.76)</td><td>(0.45)</td><td>(0.98)</td><td>(0.83)</td><td>(0.92)</td><td>(1.18)</td></tr><tr><td rowspan=\"2\">Novel</td><td>33.43</td><td>31.53</td><td>41.66</td><td>29.87</td><td>35.13</td><td>29.31</td><td>29.56</td><td>21.70</td><td>20.12</td><td>19.08</td><td>18.26</td></tr><tr><td>(0.67)</td><td>(0.65)</td><td>(0.67)</td><td>(0.71)</td><td>(0.54)</td><td>(0.64)</td><td>(0.21)</td><td>(0.86)</td><td>(0.75)</td><td>(0.82)</td><td>(1.12)</td></tr><tr><td rowspan=\"4\">LIVING-17</td><td rowspan=\"2\">Same</td><td>12.63</td><td>11.05</td><td>18.32</td><td>10.46</td><td>14.43</td><td>10.14</td><td>9.87</td><td>4.57</td><td>3.95</td><td>3.81</td><td>4.21</td></tr><tr><td>(1.25)</td><td>(1.20)</td><td>(1.01)</td><td>(1.12)</td><td>(1.11)</td><td>(1.16)</td><td>(0.61)</td><td>(0.71)</td><td>(0.48)</td><td>(0.22)</td><td>(0.53)</td></tr><tr><td rowspan=\"2\">Novel</td><td>29.03</td><td>26.96</td><td>35.67</td><td>26.11</td><td>31.73</td><td>25.73</td><td>23.53</td><td>16.15</td><td>14.49</td><td>12.97</td><td>11.39</td></tr><tr><td>(1.44)</td><td>(1.38)</td><td>(1.09)</td><td>(1.27)</td><td>(1.19)</td><td>(1.35)</td><td>(0.52)</td><td>(1.36)</td><td>(1.46)</td><td>(1.52)</td><td>(1.72)</td></tr></table>",
          "format": "html"
        }
      ],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 28,
      "markdown": "Published as a conference paper at ICLR 2022\n\n[tbl-4.html](tbl-4.html)\n\nTable 4: Mean Absolute estimation Error (MAE) results for different datasets in our setup grouped by the nature of shift for ResNet model. 'Same' refers to same subpopulation shifts and 'Novel' refers novel subpopulation shifts. We include details about the target sets considered in each shift in Table 2. Post T denotes use of TS calibration on source. Across all datasets, we observe that ATC achieves superior performance (lower MAE is better). For GDE post T and pre T estimates match since TS doesn't alter the argmax prediction. Results reported by aggregating MAE numbers over 4 different seeds. Values in parenthesis (i.e.,  $(\\cdot)$ ) denote standard deviation values.",
      "images": [],
      "tables": [
        {
          "id": "tbl-4.html",
          "content": "<table><tr><td rowspan=\"2\">Dataset</td><td rowspan=\"2\">Shift</td><td colspan=\"2\">IM</td><td colspan=\"2\">AC</td><td colspan=\"2\">DOC</td><td>GDE</td><td colspan=\"2\">ATC-MC (Ours)</td><td colspan=\"2\">ATC-NE (Ours)</td></tr><tr><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Post T</td><td>Pre T</td><td>Post T</td><td>Pre T</td><td>Post T</td></tr><tr><td rowspan=\"4\">CIFAR10</td><td rowspan=\"2\">Natural</td><td>7.14</td><td>6.20</td><td>10.25</td><td>7.06</td><td>7.68</td><td>6.35</td><td>5.74</td><td>4.02</td><td>3.85</td><td>3.76</td><td>3.38</td></tr><tr><td>(0.14)</td><td>(0.11)</td><td>(0.31)</td><td>(0.33)</td><td>(0.28)</td><td>(0.27)</td><td>(0.25)</td><td>(0.38)</td><td>(0.30)</td><td>(0.33)</td><td>(0.32)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>12.62</td><td>10.75</td><td>16.50</td><td>11.91</td><td>13.93</td><td>11.20</td><td>7.97</td><td>5.66</td><td>5.03</td><td>4.87</td><td>3.63</td></tr><tr><td>(0.76)</td><td>(0.71)</td><td>(0.28)</td><td>(0.24)</td><td>(0.29)</td><td>(0.28)</td><td>(0.13)</td><td>(0.64)</td><td>(0.71)</td><td>(0.71)</td><td>(0.62)</td></tr><tr><td rowspan=\"2\">CIFAR100</td><td rowspan=\"2\">Synthetic</td><td>12.77</td><td>12.34</td><td>16.89</td><td>12.73</td><td>11.18</td><td>9.63</td><td>12.00</td><td>5.61</td><td>5.55</td><td>5.65</td><td>5.76</td></tr><tr><td>(0.43)</td><td>(0.68)</td><td>(0.20)</td><td>(2.59)</td><td>(0.35)</td><td>(1.25)</td><td>(0.48)</td><td>(0.51)</td><td>(0.55)</td><td>(0.35)</td><td>(0.27)</td></tr><tr><td rowspan=\"4\">ImageNet200</td><td rowspan=\"2\">Natural</td><td>12.63</td><td>7.99</td><td>23.08</td><td>7.22</td><td>15.40</td><td>6.33</td><td>5.00</td><td>4.60</td><td>1.80</td><td>4.06</td><td>1.38</td></tr><tr><td>(0.59)</td><td>(0.47)</td><td>(0.31)</td><td>(0.22)</td><td>(0.42)</td><td>(0.24)</td><td>(0.36)</td><td>(0.63)</td><td>(0.17)</td><td>(0.69)</td><td>(0.29)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>20.17</td><td>11.74</td><td>33.69</td><td>9.51</td><td>25.49</td><td>8.61</td><td>4.19</td><td>5.37</td><td>2.78</td><td>4.53</td><td>3.58</td></tr><tr><td>(0.74)</td><td>(0.80)</td><td>(0.73)</td><td>(0.51)</td><td>(0.66)</td><td>(0.50)</td><td>(0.14)</td><td>(0.88)</td><td>(0.23)</td><td>(0.79)</td><td>(0.33)</td></tr><tr><td rowspan=\"4\">ImageNet</td><td rowspan=\"2\">Natural</td><td>8.09</td><td>6.42</td><td>21.66</td><td>5.91</td><td>8.53</td><td>5.21</td><td>5.90</td><td>3.93</td><td>1.89</td><td>2.45</td><td>0.73</td></tr><tr><td>(0.25)</td><td>(0.28)</td><td>(0.38)</td><td>(0.22)</td><td>(0.26)</td><td>(0.25)</td><td>(0.44)</td><td>(0.26)</td><td>(0.21)</td><td>(0.16)</td><td>(0.10)</td></tr><tr><td rowspan=\"2\">Synthetic</td><td>13.93</td><td>9.90</td><td>28.05</td><td>7.56</td><td>13.82</td><td>6.19</td><td>6.70</td><td>3.33</td><td>2.55</td><td>2.12</td><td>5.06</td></tr><tr><td>(0.14)</td><td>(0.23)</td><td>(0.39)</td><td>(0.13)</td><td>(0.31)</td><td>(0.07)</td><td>(0.52)</td><td>(0.25)</td><td>(0.25)</td><td>(0.31)</td><td>(0.27)</td></tr><tr><td rowspan=\"2\">FMoW-WILDS</td><td rowspan=\"2\">Natural</td><td>5.15</td><td>3.55</td><td>34.64</td><td>5.03</td><td>5.58</td><td>3.46</td><td>5.08</td><td>2.59</td><td>2.33</td><td>2.52</td><td>2.22</td></tr><tr><td>(0.19)</td><td>(0.41)</td><td>(0.22)</td><td>(0.29)</td><td>(0.17)</td><td>(0.37)</td><td>(0.46)</td><td>(0.32)</td><td>(0.28)</td><td>(0.25)</td><td>(0.30)</td></tr><tr><td rowspan=\"2\">RxRx1-WILDS</td><td rowspan=\"2\">Natural</td><td>6.17</td><td>6.11</td><td>21.05</td><td>5.21</td><td>6.54</td><td>6.27</td><td>6.82</td><td>5.30</td><td>5.20</td><td>5.19</td><td>5.63</td></tr><tr><td>(0.20)</td><td>(0.24)</td><td>(0.31)</td><td>(0.18)</td><td>(0.21)</td><td>(0.20)</td><td>(0.31)</td><td>(0.30)</td><td>(0.44)</td><td>(0.43)</td><td>(0.55)</td></tr><tr><td rowspan=\"4\">ENTITY-13</td><td rowspan=\"2\">Same</td><td>18.32</td><td>14.38</td><td>27.79</td><td>13.56</td><td>20.50</td><td>13.22</td><td>16.09</td><td>9.35</td><td>7.50</td><td>7.80</td><td>6.94</td></tr><tr><td>(0.29)</td><td>(0.53)</td><td>(1.18)</td><td>(0.58)</td><td>(0.47)</td><td>(0.58)</td><td>(0.84)</td><td>(0.79)</td><td>(0.65)</td><td>(0.62)</td><td>(0.71)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.82</td><td>24.03</td><td>38.97</td><td>22.96</td><td>31.66</td><td>22.61</td><td>25.26</td><td>17.11</td><td>13.96</td><td>14.75</td><td>9.94</td></tr><tr><td>(0.30)</td><td>(0.55)</td><td>(1.32)</td><td>(0.59)</td><td>(0.54)</td><td>(0.58)</td><td>(1.08)</td><td>(0.84)</td><td>(0.93)</td><td>(0.64)</td><td>(0.78)</td></tr><tr><td rowspan=\"4\">ENTITY-30</td><td rowspan=\"2\">Same</td><td>16.91</td><td>14.61</td><td>26.84</td><td>14.37</td><td>18.60</td><td>13.11</td><td>13.74</td><td>8.54</td><td>7.94</td><td>7.77</td><td>8.04</td></tr><tr><td>(1.33)</td><td>(1.11)</td><td>(2.15)</td><td>(1.34)</td><td>(1.69)</td><td>(1.30)</td><td>(1.07)</td><td>(1.47)</td><td>(1.38)</td><td>(1.44)</td><td>(1.51)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.66</td><td>25.83</td><td>39.21</td><td>25.03</td><td>30.95</td><td>23.73</td><td>23.15</td><td>15.57</td><td>13.24</td><td>12.44</td><td>11.05</td></tr><tr><td>(1.16)</td><td>(0.88)</td><td>(2.03)</td><td>(1.11)</td><td>(1.64)</td><td>(1.11)</td><td>(0.51)</td><td>(1.44)</td><td>(1.15)</td><td>(1.26)</td><td>(1.13)</td></tr><tr><td rowspan=\"4\">NONLIVING-26</td><td rowspan=\"2\">Same</td><td>17.43</td><td>15.95</td><td>27.70</td><td>15.40</td><td>18.06</td><td>14.58</td><td>16.99</td><td>10.79</td><td>10.13</td><td>10.05</td><td>10.29</td></tr><tr><td>(0.90)</td><td>(0.86)</td><td>(0.90)</td><td>(0.69)</td><td>(1.00)</td><td>(0.78)</td><td>(1.25)</td><td>(0.62)</td><td>(0.32)</td><td>(0.46)</td><td>(0.79)</td></tr><tr><td rowspan=\"2\">Novel</td><td>29.51</td><td>27.75</td><td>40.02</td><td>26.77</td><td>30.36</td><td>25.93</td><td>27.70</td><td>19.64</td><td>17.75</td><td>16.90</td><td>15.69</td></tr><tr><td>(0.86)</td><td>(0.82)</td><td>(0.76)</td><td>(0.82)</td><td>(0.95)</td><td>(0.80)</td><td>(1.42)</td><td>(0.68)</td><td>(0.53)</td><td>(0.60)</td><td>(0.83)</td></tr><tr><td rowspan=\"4\">LIVING-17</td><td rowspan=\"2\">Same</td><td>14.28</td><td>12.21</td><td>23.46</td><td>11.16</td><td>15.22</td><td>10.78</td><td>10.49</td><td>4.92</td><td>4.23</td><td>4.19</td><td>4.73</td></tr><tr><td>(0.96)</td><td>(0.93)</td><td>(1.16)</td><td>(0.90)</td><td>(0.96)</td><td>(0.99)</td><td>(0.97)</td><td>(0.57)</td><td>(0.42)</td><td>(0.35)</td><td>(0.24)</td></tr><tr><td rowspan=\"2\">Novel</td><td>28.91</td><td>26.35</td><td>38.62</td><td>24.91</td><td>30.32</td><td>24.52</td><td>22.49</td><td>15.42</td><td>13.02</td><td>12.29</td><td>10.34</td></tr><tr><td>(0.66)</td><td>(0.73)</td><td>(1.01)</td><td>(0.61)</td><td>(0.59)</td><td>(0.74)</td><td>(0.85)</td><td>(0.59)</td><td>(0.53)</td><td>(0.73)</td><td>(0.62)</td></tr></table>",
          "format": "html"
        }
      ],
      "hyperlinks": [],
      "header": null,
      "footer": null,
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    }
  ],
  "model": "mistral-ocr-2512",
  "document_annotation": null,
  "usage_info": {
    "pages_processed": 29,
    "doc_size_bytes": 3002783
  }
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="delete-file">Delete File</SectionTab>

Once all OCR done, you can optionally delete the pdf file from our cloud unless you wish to reuse it later.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
client.files.delete(file_id=file.id)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript
await client.files.delete(fileId=file.id);
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl -X DELETE https://api.mistral.ai/v1/files/${file_id} \
-H "Authorization: Bearer ${MISTRAL_API_KEY}"
```

  </TabItem>
  <TabItem value="output" label="output">

```json
{
"id": "22e2e88f-167d-4f3d-982a-add977a54ec3",
"object": "file",
"deleted": true
}
```

  </TabItem>
</Tabs>
    </ExplorerTab>
</ExplorerTabs>

The output will be a JSON object containing the extracted text content, images bboxes, metadata and other information about the document structure.

```py
{
  "pages": [ # The content of each page
    {
      "index": int, # The index of the corresponding page
      "markdown": str, # The main output and raw markdown content
      "images": list, # Image information when images are extracted
      "tables": list, # Table information when using `table_format=html` or `table_format=markdown`
      "hyperlinks": list, # Hyperlinks detected
      "header": str|null, # Header content when using `extract_header=True`
      "footer": str|null, # Footer content when using `extract_footer=True`
      "dimensions": dict # The dimensions of the page
    }
  ],
  "model": str, # The model used for the OCR
  "document_annotation": dict|null, # Document annotation information when used, visit the Annotations documentation for more information
  "usage_info": dict # Usage information
}
```

:::note
When extracting images and tables they will be replaced with placeholders, such as:
- `![img-0.jpeg](img-0.jpeg)`
- `[tbl-3.html](tbl-3.html)`

You can map them to the actual images and tables by using the `images` and `tables` fields.
:::

<SectionTab as="h2" variant="secondary" sectionId="ocr-images">Images</SectionTab>

To perform OCR on an image, you can either pass a URL to the image or directly use a Base64 encoded image.

<ExplorerTabs id="images">
    <ExplorerTab value="with-image-url" label="OCR with an Image URL">
        You can perform OCR with any public available image as long as a direct url is available.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]

client = Mistral(api_key=api_key)

ocr_response = client.ocr.process(
    model="mistral-ocr-latest",
    document={
        "type": "image_url",
        "image_url": "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png"
    },
    # table_format=None,
    include_image_base64=True
)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
        type: "image_url",
        imageUrl: "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png",
    },
    // tableFormat: null,
    includeImageBase64: true
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/ocr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
  -d '{
    "model": "mistral-ocr-latest",
    "document": {
        "type": "image_url",
        "image_url": "https://raw.githubusercontent.com/mistralai/cookbook/refs/heads/main/mistral/ocr/receipt.png"
    },
    "include_image_base64": true
  }' -o ocr_output.json
```

  </TabItem>
  <TabItem value="output" label="output">
```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "PLACE FACE UP ON DASH\nCITY OF PALO ALTO\nNOT VALID FOR\nONSTREET PARKING\n\nExpiration Date/Time\n11:59 PM\nAUG 19, 2024\n\nPurchase Date/Time: 01:34pm Aug 19, 2024\nTotal Due: $15.00\nTotal Paid: $15.00\nTicket #: 00005883\nS/N #: 520117260957\nSetting: Permit Machines\nMach Name: Civic Center\n\n#****-1224, Visa\nDISPLAY FACE UP ON DASH\n\nPERMIT EXPIRES\nAT MIDNIGHT",
      "images": [],
      "dimensions": {
        "dpi": 200,
        "height": 3210,
        "width": 1806
      }
    }
  ],
  "model": "mistral-ocr-2505-completion",
  "document_annotation": null,
  "usage_info": {
    "pages_processed": 1,
    "doc_size_bytes": 3110191
  }
}
```
    </TabItem>
</Tabs>
    </ExplorerTab>
    <ExplorerTab value="with-image-base64" label="OCR with a Base64 encoded Image">
        You can perform OCR with any public available image as long as a direct url is available.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
import base64
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]

client = Mistral(api_key=api_key)

def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

image_path = "path_to_your_image.jpg"
base64_image = encode_image(image_path)

ocr_response = client.ocr.process(
    model="mistral-ocr-latest",
    document={
        "type": "image_url",
        "image_url": f"data:image/jpeg;base64,{base64_image}" 
    },
    # table_format=None,
    include_image_base64=True
)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```ts

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

async function encodeImage(imagePath) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    return base64Image;
}

const imagePath = "path_to_your_image.jpg";
const base64Image = await encodeImage(imagePath);

const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
        type: "image_url",
        imageUrl: "data:image/jpeg;base64," + base64Image
    },
    // tableFormat: null,
    includeImageBase64: true
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/ocr \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
  -d '{
    "model": "mistral-ocr-latest",
    "document": {
        "type": "image_url",
        "image_url": "data:image/jpeg;base64,<base64_image>"
    },
    "include_image_base64": true
  }' -o ocr_output.json
```

  </TabItem>
    <TabItem value="output" label="output">

```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "PLACE FACE UP ON DASH\nCITY OF PALO ALTO\nNOT VALID FOR\nONSTREET PARKING\n\nExpiration Date/Time\n11:59 PM\nAUG 19, 2024\n\nPurchase Date/Time: 01:34pm Aug 19, 2024\nTotal Due: $15.00\nTotal Paid: $15.00\nTicket #: 00005883\nS/N #: 520117260957\nSetting: Permit Machines\nMach Name: Civic Center\n\n#****-1224, Visa\nDISPLAY FACE UP ON DASH\n\nPERMIT EXPIRES\nAT MIDNIGHT",
      "images": [],
      "dimensions": {
        "dpi": 200,
        "height": 3210,
        "width": 1806
      }
    }
  ],
  "model": "mistral-ocr-2505-completion",
  "document_annotation": null,
  "usage_info": {
    "pages_processed": 1,
    "doc_size_bytes": 3110191
  }
}
```
    </TabItem>
</Tabs>
    </ExplorerTab>
</ExplorerTabs>

The output will be a JSON object containing the extracted text content, images bboxes, metadata and other information about the document structure.

```py
{
  "pages": [ # The content of each page
    {
      "index": int, # The index of the corresponding page
      "markdown": str, # The main output and raw markdown content
      "images": list, # Image information when images are extracted
      "tables": list, # Table information when using `table_format=html` or `table_format=markdown`
      "hyperlinks": list, # Hyperlinks detected
      "header": str|null, # Header content when using `extract_header=True`
      "footer": str|null, # Footer content when using `extract_footer=True`
      "dimensions": dict # The dimensions of the page
    }
  ],
  "model": str, # The model used for the OCR
  "document_annotation": dict|null, # Document annotation information when used, visit the Annotations documentation for more information
  "usage_info": dict # Usage information
}
```

:::note
When extracting images and tables they will be replaced with placeholders, such as:
- `![img-0.jpeg](img-0.jpeg)`
- `[tbl-3.html](tbl-3.html)`

You can map them to the actual images and tables by using the `images` and `tables` fields.
:::

<SectionTab as="h1" sectionId="ocr-at-scale">OCR at Scale</SectionTab>

When performing OCR at scale, we recommend using our [Batch Inference service](../batch), this allows you to process large amounts of documents in parallel while being more cost-effective than using the OCR API directly. We also support [Annotations](annotations) for structured outputs and other features.

<SectionTab as="h1" sectionId="cookbooks">Cookbooks</SectionTab>

For more information and guides on how to make use of OCR, we have the following cookbooks:
- [Tool Use](https://colab.research.google.com/github/mistralai/cookbook/blob/main/mistral/ocr/tool_usage.ipynb)
- [Batch OCR](https://colab.research.google.com/github/mistralai/cookbook/blob/main/mistral/ocr/batch_ocr.ipynb)

<SectionTab as="h1" sectionId="faq">FAQ</SectionTab>

<Faq>
  <FaqItem question="Are there any limits regarding the OCR API?">
    Yes, there are certain limitations for the OCR API. Uploaded document files must not exceed 50 MB in size and should be no longer than 1,000 pages.
  </FaqItem>
  <FaqItem question="What document types are supported?">
Our Document AI OCR Processor supports a vast range of document and image types. Below you can find a non-exhaustive list of the supported formats:
| Documents                      | Images                       |
| ------------------------------ | ---------------------------- |
| **PDF** (.pdf)                 | **JPEG** (.jpg, .jpeg)       |
| **Word Documents** (.docx)     | **PNG** (.png)               |
| **PowerPoint** (.pptx)         | **AVIF** (.avif)             |
| **Text Files** (.txt)          | **TIFF** (.tiff)             |
| **EPUB** (.epub)               | **GIF** (.gif)               |
| **XML/DocBook** (.xml)         | **HEIC/HEIF** (.heic, .heif) |
| **RTF** (.rtf)                 | **BMP** (.bmp)               |
| **OpenDocument Text** (.odt)   | **WebP** (.webp)             |
| **BibTeX/BibLaTeX** (.bib)     |                              |
| **FictionBook** (.fb2)         |                              |
| **Jupyter Notebooks** (.ipynb) |                              |
| **JATS XML** (.xml)            |                              |
| **LaTeX** (.tex)               |                              |
| **OPML** (.opml)               |                              |
| **Troff** (.1, .man)           |                              |
| </FaqItem>                     |                              |
| </Faq>                         |                              |


---
id: annotations 
title: Annotations
slug: annotations
sidebar_position: 3.2
---

# Annotations

In addition to the basic OCR functionality, Mistral Document AI API adds the `annotations` functionality, which allows you to extract information in a structured json-format that you provide.

<SectionTab as="h1" sectionId="before-you-start">Before You Start</SectionTab>

### What can you do with Annotations?

Specifically, it offers two types of annotations: 
- `bbox_annotation`: gives you the annotation of the bboxes extracted by the OCR model (charts/ figures etc) based on user requirement and provided bbox/image annotation format. The user may ask to describe/caption the figure for instance.
- `document_annotation`: returns the annotation of the entire document based on the provided document annotation format.

<Image
  url={['/img/ocr_annotations_explanation.png', '/img/ocr_annotations_explanation_dark.png']}
  alt="annotations_explanation_graph"
  width="600px"
  centered
/>

<SectionTab as="h2" variant="secondary" sectionId="key-capabilities">Key Capabilities</SectionTab>

* Labeling and annotating data
* Extraction and structuring of specific information from documents into a predefined JSON format
* Automation of data extraction to reduce manual entry and errors
* Efficient handling of large document volumes for enterprise-level applications

<SectionTab as="h2" variant="secondary" sectionId="common-use-cases">Common Use Cases</SectionTab>

* Parsing of forms, classification of documents, and processing of images, including text, charts, and signatures
* Conversion of charts to tables, extraction of fine print from figures, or definition of custom image types
* Capture of receipt data, including merchant names and transaction amounts, for expense management.
* Extraction of key information like vendor details and amounts from invoices for automated accounting.
* Extraction of key clauses and terms from contracts for easier review and management

<SectionTab as="h1" sectionId="how-it-works">How it Works</SectionTab>

<Image
  url={['/img/ocr_annotations_workflow.png', '/img/ocr_annotations_workflow_dark.png']}
  alt="annotations_workflow_graph"
  width="800px"
  centered
/>

<SectionTab as="h2" variant="secondary" sectionId="bbox-annotations-explanation">BBOX Annotations</SectionTab>

- All document types: 
  - After regular OCR is finished; we call a Vision capable LLM for all bboxes individually with the provided annotation format.

<SectionTab as="h2" variant="secondary" sectionId="document-annotation-explanation">Document Annotation</SectionTab>

- All document types: 
  - We run OCR and send the output text in Markdown, along with the first eight extracted image bounding boxes, to a vision-capable LMM, together with the provided annotation format.

<SectionTab as="h2" variant="secondary" sectionId="accepted-formats">Accepted Formats</SectionTab>

You can use our API with the following document formats:
- [OCR with pdf](basic_ocr#ocr-with-pdf)
- [OCR with image](basic_ocr#ocr-with-image): even from low-quality or handwritten sources.
- scans, DOCX, PPTX...

In the code snippets below, we will consider the `OCR with pdf` format.

<SectionTab as="h1" sectionId="usage">Usage</SectionTab>

### How to Annotate

As previously mentionned, you can either:
- Use the `bbox_annotation` functionality, allowing you to extract information from the bboxes of the document.
- Use the `document_annotation` functionality, allowing you to extract information from the entire document.
  - Optionally, we also provide the ability to add a `document_annotation_prompt`, a high level general prompt to guide and instruct on how to annotate the document.
- Use both functionalities at the same time.

<ExplorerTabs id="usage">
  <ExplorerTab value="bbox-annotation" label="BBox Annotation">
    Here is an example of how to use our BBox Annotation functionalities.

<SectionTab as="h3" variant="secondary" sectionId="bbox-define-the-data-model">Define the Data Model</SectionTab>

First, define the response formats for `BBox Annotation`, using either Pydantic or Zod schemas for our SDKs, or a JSON schema for a curl API call.

Pydantic/Zod/JSON schemas accept nested objects, arrays, enums, etc...

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
from pydantic import BaseModel

# BBOX Annotation response formats
class Image(BaseModel):
  image_type: str
  short_description: str
  summary: str
```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript

// BBOX Annotation response formats
const ImageSchema = z.object({
  image_type: z.string(),
  short_description: z.string(),
  summary: z.string(),
});
```

    </TabItem>
    <TabItem value="curl" label="curl json schema">

```bash
{
  "type": "json_schema",
  "json_schema": {
    "schema": {
      "properties": {
        "document_type": {
          "title": "Document_Type",
          "type": "string"
        },
        "short_description": {
          "title": "Short_Description",
          "type": "string"
        },
        "summary": {
          "title": "Summary",
          "type": "string"
        }
      },
      "required": [
        "document_type",
        "short_description",
        "summary"
      ],
      "title": "BBOXAnnotation",
      "type": "object",
      "additionalProperties": false
    },
    "name": "document_annotation",
    "strict": true
  }
}
```

    </TabItem>
</Tabs>

You can also provide a description for each entry, the description will be used as detailed information and instructions during the annotation; for example:

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
from pydantic import BaseModel, Field

# BBOX Annotation response formats
class Image(BaseModel):
  image_type: str = Field(..., description="The type of the image.")
  short_description: str = Field(..., description="A description in english describing the image.")
  summary: str = Field(..., description="Summarize the image.")
```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript

// Define the schema for the Image type
const ImageSchema = z.object({
  image_type: z.string().describe("The type of the image."),
  short_description: z.string().describe("A description in English describing the image."),
  summary: z.string().describe("Summarize the image."),
});
```

    </TabItem>
    <TabItem value="curl" label="curl json schema">

```bash
{
  "type": "json_schema",
  "json_schema": {
    "schema": {
      "properties": {
        "document_type": {
          "title": "Document_Type",
          "description": "The type of the image.",
          "type": "string"
        },
        "short_description": {
          "title": "Short_Description",
          "description": "A description in English describing the image.",
          "type": "string"
        },
        "summary": {
          "title": "Summary",
          "description": "Summarize the image.",
          "type": "string"
        }
      },
      "required": [
        "document_type",
        "short_description",
        "summary"
      ],
      "title": "BBOXAnnotation",
      "type": "object",
      "additionalProperties": false
    },
    "name": "document_annotation",
    "strict": true
  }
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="bbox-start-request">Start Request</SectionTab>

Next, make a request and ensure the response adheres to the defined structures using `bbox_annotation_format` set to the corresponding schemas:

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
import os
from mistralai import Mistral, DocumentURLChunk, ImageURLChunk, ResponseFormat
from mistralai.extra import response_format_from_pydantic_model

api_key = os.environ["MISTRAL_API_KEY"]

client = Mistral(api_key=api_key)

response = client.ocr.process(
    model="mistral-ocr-latest",
    document=DocumentURLChunk(
      document_url="https://arxiv.org/pdf/2410.07073"
    ),
    bbox_annotation_format=response_format_from_pydantic_model(Image),
    include_image_base64=True
  )
```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

async function processDocument() {
  try {
    const response = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "document_url",
        documentUrl: "https://arxiv.org/pdf/2410.07073"
      },
      bboxAnnotationFormat: responseFormatFromZodObject(ImageSchema),
      includeImageBase64: true,
    });

    console.log(response);
  } catch (error) {
    console.error("Error processing document:", error);
  }
}

processDocument();
```

    </TabItem>
    <TabItem value="curl" label="curl">

```bash
curl --location 'https://api.mistral.ai/v1/ocr' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${MISTRAL_API_KEY}" \
--data '{
    "model": "mistral-ocr-latest",
    "document": {"document_url": "https://arxiv.org/pdf/2410.07073"},
    "bbox_annotation_format": {
        "type": "json_schema",
        "json_schema": {
            "schema": {
                "properties": {
                    "document_type": {"title": "Document_Type", "description": "The type of the image.", "type": "string"},
                    "short_description": {"title": "Short_Description", "description": "A description in English describing the image.", "type": "string"},
                    "summary": {"title": "Summary", "description": "Summarize the image.", "type": "string"}
                },
                "required": ["document_type", "short_description", "summary"],
                "title": "BBOXAnnotation",
                "type": "object",
                "additionalProperties": false
            },
            "name": "document_annotation",
            "strict": true
        }
    },
    "include_image_base64": true
}'
```

    </TabItem>
    <TabItem value="output" label="output">

```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "# Pixtral 12B \n\n![img-0.jpeg](img-0.jpeg)\n\n## Abstract\n\nWe introduce Pixtral 12B, a 12-billion-parameter multimodal language model. Pixtral 12B is trained to understand both natural images and documents, achieving leading performance on various multimodal benchmarks, surpassing a number of larger models. Unlike many open-source models, Pixtral is also a cutting-edge text model for its size, and does not compromise on natural language performance to excel in multimodal tasks. Pixtral uses a new vision encoder trained from scratch, which allows it to ingest images at their natural resolution and aspect ratio. This gives users flexibility on the number of tokens used to process an image. Pixtral is also able to process any number of images in its long context window of 128 K tokens. Pixtral 12B substanially outperforms other open models of similar sizes (Llama-3.2 11B \\& Qwen-2-VL 7B). It also outperforms much larger open models like Llama-3.2 90B while being 7x smaller. We further contribute an open-source benchmark, MM-MT-Bench, for evaluating vision-language models in practical scenarios, and provide detailed analysis and code for standardized evaluation protocols for multimodal LLMs. Pixtral 12B is released under Apache 2.0 license.\n\nWebpage: https://mistral.ai/news/pixtral-12b/\nInference code: https://github.com/mistralai/mistral-inference/\nEvaluation code: https://github.com/mistralai/mistral-evals/\n\n## 1 Introduction\n\nThis paper describes Pixtral 12B, a multimodal language model trained to understand both images and text, released with open weights under an Apache 2.0 license. Pixtral is an instruction tuned model which is pretrained on large scale interleaved image and text documents, and hence is capable of multi-turn, multi-image conversation.\n\nPixtral comes with a new vision encoder which is trained with a novel RoPE-2D implementation, allowing it to process images at their native resolution and aspect ratio. In this way, the model can flexibly process images at low resolution in latency-constrained settings, while processing images at high resolution when fine-grained reasoning is required.\nWhen compared against models of a similar size in the same evaluation setting, we find that Pixtral delivers strong multimodal reasoning capabilities without sacrificing text-only reasoning performance.",
      "images": [
        {
          "id": "img-0.jpeg",
          "top_left_x": 413,
          "top_left_y": 563,
          "bottom_right_x": 1286,
          "bottom_right_y": 862,
          "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ...",
          "image_annotation": "{\n  \"image_type\": \"Logo\",\n  \"short_description\": \"A 3D-rendered logo of the text 'Mistral AI' with a gradient color scheme transitioning from orange to yellow.\",\n  \"summary\": \"The image features a 3D-rendered logo of the text 'Mistral AI'. The text is stylized with a gradient color scheme that transitions from a warm orange to a bright yellow, giving it a vibrant and modern appearance. The letters are slightly tilted to the right, adding a dynamic touch to the overall design.\"\n}"
        }
      ],
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 1,
      "markdown": "![img-1.jpeg](img-1.jpeg)\n\nFigure 1: Pixtral Performance. Pixtral outperforms all open-models within its weight class on multimodal tasks by a substantial margin. Left: Performance on MM-MT-Bench, a new multimodal, multiturn, instruction following benchmark designed to reflect real world usage of multimodal language models. Right: Performance on the public LMSys leaderboard (Vision arena, October 2024).\n\nFor instance, our model matches or exceeds the performance of models like Qwen2-VL 7B [23] and Llama-3.2 11B [6] on popular multimodal benchmarks like MMMU [24] and MathVista [14], while outperforming most open-source models on popular text-only tasks like MATH [7] and HumanEval [26]. Pixtral even outperforms much larger models like Llama-3.2 90B [6], as well as closed models such as Claude-3 Haiku [1] and Gemini-1.5 Flash 8B [18], on multimodal benchmarks.\n\nDuring evaluation of Pixtral and the baselines, we found that evaluation protocols for multimodal language models is not standardized, and that small changes in the setup can dramatically change the performance of some models. We provide thorough analysis of our experience in re-evaluating vision-language models under a common evaluation protocol.\n\nSpecifically, we identify two issues with evaluation:\n\n- Prompts: Several benchmarks have default prompts which are under-specified, and dramatically reduce the performance of leading closed source models [16, 1] compared to reported figures.\n- Evaluation Metrics: The official metrics typically require exact match, which score model generations as correct only if they exactly match the reference answer. However, this metric penalizes answers which are substantively correct but in a slightly different format (e.g., \"6.0\" vs \"6\").\n\nTo alleviate these issues, we propose 'Explicit' prompts that explicitly specify the format required by the reference answer. We further analyze the impact of flexible parsing for various models, releasing the evaluation code and prompts in an effort to establish fair and standardized evaluation protocols ${ }^{1}$.\n\nMoreover, while current multimodal benchmarks mostly evaluate short-form or multiple-choice question answering given an input image, they do not fully capture a model's utility for practical use cases (e.g. in a multi-turn, long-form assistant setting). To address this, we open-source a novel multimodal, multi-turn evaluation: MM-MT-Bench ${ }^{2}$. We find that performance on MM-MT-Bench correlates highly with ELO rankings on the LMSys Vision Leaderboard.\n\nPixtral excels at multimodal instruction following, surpassing comparable open-source models on the MM-MT-Bench benchmark (see Figure 1). Based on human preferences on the LMSys Vision Leaderboard, Pixtral 12B is currently the highest ranked Apache 2.0 model, substantially outperforming other open-models such Llama-3.2 11B [6] and Qwen2-VL 7B [23]. It even ranks higher than several closed models such as Claude-3 Opus \\& Claude-3 Sonnet [1], and several larger models such as Llama-3.2 90B [6].\n\n[^0]\n[^0]:    ${ }^{1}$ https://github.com/mistralai/mistral-evals/\n    ${ }^{2}$ https://huggingface.co/datasets/mistralai/MM-MT-Bench",
      "images": [
        {
          "id": "img-1.jpeg",
          "top_left_x": 294,
          "top_left_y": 193,
          "bottom_right_x": 1405,
          "bottom_right_y": 675,
          "image_base64": "...",
          "image_annotation": "{\n  \"image_type\": \"scatter plot\",\n  \"short_description\": \"This image shows two scatter plots comparing the performance and cost of various AI models.\",\n  \"summary\": \"The image consists of two scatter plots. The left plot compares the performance on the MM-MT-Bench against the cost/number of parameters (in billions) for different AI models. The right plot compares the performance on the LMSys-Vision ELO against the same cost/number of parameters. In both plots, the Pixtral 12B model is highlighted as having the best performance/cost ratio. Other models like Qwen-2-VL 72B, Llama-3.2 90B, and Llama-3.2 11B are also shown, with varying performance and cost metrics. The plots indicate that Pixtral 12B offers a strong balance of performance and cost efficiency.\"\n}"
        }
      ],
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 2,
      "markdown": "![img-2.jpeg](img-2.jpeg)\n\nFigure 2: Pixtral Vision Encoder. Pixtral uses a new vision encoder, which is trained from scratch to natively support variable image sizes and aspect ratios. Block-diagonal attention masks enable sequence packing for batching, while RoPE-2D encodings facilitate variable image sizes. Note that the attention mask and position encodings are fed to the vision transformer as additional input, and utilized only in the self-attention layers.\n\n# 2 Architectural details \n\nPixtral 12B is based on the transformer architecture [22], and consists of a multimodal decoder to perform highlevel reasoning, and a vision encoder to allow the model to ingest images. The main parameters of the model are summarized in Table 1.\n\n### 2.1 Multimodal Decoder\n\nPixtral 12B is built on top of Mistral Nemo 12B [15], a 12-billion parameter decoder-only language model that achieves strong performance across a range of knowledge and reasoning tasks.\n\n| Parameters | Decoder | Encoder |\n| :-- | --: | --: |\n| dim | 5120 | 1024 |\n| n_layers | 40 | 24 |\n| head_dim | 128 | 64 |\n| hidden_dim | 14336 | 4096 |\n| n_heads | 32 | 16 |\n| n_kv_heads | 8 | 16 |\n| context_len | 131072 | 4096 |\n| vocab_size | 131072 | - |\n| patch_size | - | 16 |\n\nTable 1: Decoder and encoder parameters.\n\n### 2.2 Vision Encoder\n\nIn order for Pixtral 12B to ingest images, we train a new vision encoder from scratch, named PixtralViT. Here, our goal is to instantiate a simple architecture which is capable of processing images across a wide range of resolutions and aspect ratios. To do this, we build a 400 million parameter vision transformer [5] (see Table 1) and make four key changes over the standard architectures [17]:\nBreak tokens: In order to assist the model in distinguishing between images with the same number of patches (same area) but different aspect ratios, we include [IMAGE BREAK] tokens between image rows [2]. We further include an [IMAGE END] token at the end of an image sequence.\nGating in FFN: Instead of standard feedforward layer in the attention block, we use gating in the hidden layer [19].\nSequence packing: In order to efficiently process images within a single batch, we flatten the images along the sequence dimension and concatenate them [3]. We construct a block-diagonal mask to ensure no attention leakage between patches from different images.\nRoPE-2D: We replace traditional learned and absolute position embeddings for image patches with relative, rotary position encodings [11, 20] in the self-attention layers. While learned position embeddings must be interpolated to deal with new image sizes (often at the cost of performance), relative position encodings lend themselves naturally to variable image sizes.",
      "images": [
        {
          "id": "img-2.jpeg",
          "top_left_x": 309,
          "top_left_y": 191,
          "bottom_right_x": 1387,
          "bottom_right_y": 655,
          "image_base64": "...",
          "image_annotation": "{\n  \"image_type\": \"diagram\",\n  \"short_description\": \"A diagram illustrating the architecture of the Pixtral-ViT model.\",\n  \"summary\": \"The diagram shows the architecture of the Pixtral-ViT model, which processes image patches through various stages. Starting with image patches, the model applies RoPE-2D positional embeddings and a block-diagonal attention mask. The processed data is then fed into a bidirectional transformer, followed by a vision-language projector, and finally, output embeddings are generated. The diagram also includes visual representations of the positional embeddings and attention mechanisms used in the model.\"\n}"
        }
      ],
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    ...
    {
      "index": 23,
      "markdown": "|  | Mathvista <br> 2017 | MMMU <br> 2017 | ChartQA <br> 2017 | DocVQA <br> 2017 | VQAr2 <br> 2017 March | MM-MT-Bench <br> 2017 to 2020 | LMSys-Vision <br> Nov 2017 |\n| :--: | :--: | :--: | :--: | :--: | :--: | :--: | :--: |\n| Pixtral 12B | 58.3 | 52.0 | 81.8 | 90.7 | 78.6 | 6.05 | 1076 |\n| Qwen-2-VL 7B [23] |  |  |  |  |  |  |  |\n| Measured (Exact Match) | 53.7 | 48.1 | 41.2 | 94.5 | 75.9 | 5.45 |  |\n| Measured (Custom evaluation, see Section E.3) | 63.7 | 50.6 | 83.4 | 94.5 | 82.1 | - | 1040 |\n| Reported | 58.2 | 54.1 | 83.0 | 94.5 | - | - |  |\n| Llama-3.2 11B [6] |  |  |  |  |  |  |  |\n| Measured (Exact Match) | 24.3 | 23.0 | 14.8 | 91.1 | 67.1 | 4.79 |  |\n| Measured (Custom evaluation, see Section E.4) | 47.9 | 46.6 | 78.5 | 91.1 | 67.1 | - | 1032 |\n| Reported | 51.5 | 50.7 | 83.4 | 88.4 | 75.2 | - |  |\n| Molmo-D 7B [4] |  |  |  |  |  |  |  |\n| Measured (Exact Match) | 12.3 | 24.3 | 27.0 | 72.2 | 57.1 | 3.72 |  |\n| Measured (Custom evaluation, see Section E.6) | 43.2 | 47.0 | 76.7 | 72.2 | 70.0 | - | - |\n| Reported | 51.6 | 45.3 | 84.1 | 92.2 | 85.6 | - |  |\n| LLaVA-OneVision 7B [9] |  |  |  |  |  |  |  |\n| Measured (Exact Match) | 36.1 | 45.1 | 67.2 | 90.5 | 78.4 | 4.12 |  |\n| Measured (Custom evaluation, see Section E.5) | 63.1 | 48.1 | 80.2 | 90.5 | 83.7 | - | - |\n| Reported | 63.2 | 48.8 | 80.0 | 87.5 | - | - |  |\n| Molmo 72B [4] |  |  |  |  |  |  | - |\n| Measured (Exact Match) | 52.2 | 52.7 | 75.6 | 86.5 | 75.2 | 3.51 |  |\n| Measured (Custom evaluation, see Section E.6) | 61.3 | 52.9 | 82.3 | 86.5 | 75.5 | - | - |\n| Reported | 58.6 | 54.1 | 87.3 | 93.5 | 86.5 | - |  |\n| Llama-3.2 90B [6] |  |  |  |  |  |  |  |\n| Measured (Exact Match) | 49.1 | 53.7 | 33.8 | 85.7 | 67.0 | 5.50 |  |\n| Measured (Custom evaluation, see Section E.4) | 57.5 | 60.2 | 91.7 | 91.5 | 67.0 | - | 1071 |\n| Reported | 57.3 | 60.3 | 85.5 | 90.1 | 78.1 | - |  |\n| Claude-3 Haiku [1] |  |  |  |  |  |  |  |\n| Measured (Exact Match) | 44.8 | 50.4 | 69.6 | 74.6 | 68.4 | 5.46 |  |\n| Measured (Custom evaluation, see Section E.2) | 44.8 | 51.3 | 79.8 | 74.6 | 68.4 | - | 1000 |\n| Reported | 46.4 | 50.2 | 81.7 | 88.8 | - | - |  |\n| Gemini-1.5-Flash 8B[18,17, [18] |  |  |  |  |  |  |  |\n| Measured (Exact Match) | 56.9 | 50.7 | 78.0 | 79.5 | 65.5 | 5.93 |  |\n| Measured (Custom evaluation, see Section E.2) | 57.1 | 50.7 | 78.2 | 79.5 | 69.2 | - | 1111 |\n| Reported | - | 50.3 | - | 75.6 | - | - |  |\n\nTable 8: Reproducing the reported performance of prior models. In Table 2 we conduct fair re-evaluation of all models through the same evaluation harness, with the same prompt and metric. Here, we endeavour to recover the reported performance of all models by tuning evaluation settings towards individual models. We highlight that Pixtral 12B, like strong closed-source models (e.g. Gemini-1.5-Flash 8B [18] and Claude-3 Haiku [1]) is able reports strong performance without such interventions.",
      "images": [],
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    }
  ],
  "model": "mistral-ocr-2505-completion",
  "document_annotation": null,
  "usage_info": {
    "pages_processed": 24,
    "doc_size_bytes": 12640953
  }
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="bbox-example-output">BBox Annotation Example Output</SectionTab>

The BBox Annotation feature allows to extract data and annotate images that were extracted from the original document, below you have one of the images of a document extracted by our OCR Processor.

<div style={{ textAlign: 'center' }}>
  <img
    src="/img/img-1.jpeg"
    alt="bbox-image"
    width="800"
    style={{ borderRadius: '15px' }}
    className='mx-auto' 
  />
</div>

The Image extracted is provided in a base64 encoded format.

```json
{ 
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGB{LONG_MIDDLE_SEQUENCE}KKACiiigAooooAKKKKACiiigD//2Q==..." 
}
```

And you can annotate the image with the model schema you want, below you have an example output.

```json
{
  "image_type": "scatter plot",
  "short_description": "Comparison of different models based on performance and cost.",
  "summary": "The image consists of two scatter plots comparing various models on two different performance metrics against their cost or number of parameters. The left plot shows performance on the MM-MT-Bench, while the right plot shows performance on the LMSys-Vision ELO. Each point represents a different model, with the x-axis indicating the cost or number of parameters in billions (B) and the y-axis indicating the performance score. The shaded region in both plots highlights the best performance/cost ratio, with Pixtral 12B positioned within this region in both plots, suggesting it offers a strong balance of performance and cost efficiency. Other models like Qwen-2-VL 72B and Qwen-2-VL 7B also show high performance but at varying costs."
}
```
  </ExplorerTab>
  <ExplorerTab value="document-annotation" label="Document Annotation">
     Here is an example of how to use our Document Annotation functionalities.

<SectionTab as="h3" variant="secondary" sectionId="document-define-the-data-model">Define the Data Model</SectionTab>

First, define the response formats for `Document Annotation`, using either Pydantic or Zod schemas for our SDKs, or a JSON schema for a curl API call.

Pydantic/Zod/JSON schemas accept nested objects, arrays, enums, etc...

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
from pydantic import BaseModel

# Document Annotation response format
class Document(BaseModel):
  language: str
  chapter_titles: list[str]
  urls: list[str]
```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript

// Document Annotation response format
const DocumentSchema = z.object({
  language: z.string(),
  chapter_titles: z.array(z.string()),
  urls: z.array(z.string()),
});
```

    </TabItem>
    <TabItem value="curl" label="curl">

```json
{
  "type": "json_schema",
  "json_schema": {
    "schema": {
      "properties": {
        "language": {
          "title": "Language",
          "type": "string"
        },
        "chapter_titles": {
          "title": "Chapter_Titles",
          "type": "string"
        },
        "urls": {
          "title": "urls",
          "type": "string"
        }
      },
      "required": [
        "language",
        "chapter_titles",
        "urls"
      ],
      "title": "DocumentAnnotation",
      "type": "object",
      "additionalProperties": false
    },
    "name": "document_annotation",
    "strict": true
  }
}
```

    </TabItem>
</Tabs>

You can also provide a description for each entry, the description will be used as detailed information and instructions during the annotation; for example:

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
from pydantic import BaseModel, Field

# Document Annotation response format
class Document(BaseModel):
  language: str = Field(..., description="The language of the document.")
  chapter_titles: list[str] = Field(..., description="List of chapter titles found in the document.")
  urls: list[str] = Field(..., description="List of URLs found in the document.")
```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript

// Document Annotation response format
const DocumentSchema = z.object({
  language: z.string().describe("The language of the document."),
  chapter_titles: z.array(z.string()).describe("List of chapter titles found in the document."),
  urls: z.array(z.string()).describe("List of URLs found in the document."),
});
```

    </TabItem>
    <TabItem value="curl" label="curl json schema">

```json
{
  "type": "json_schema",
  "json_schema": {
    "schema": {
      "properties": {
        "language": {
          "title": "Language",
          "description": "The language of the document.",
          "type": "string"
        },
        "chapter_titles": {
          "title": "Chapter_Titles",
          "description": "List of chapter titles found in the document.",
          "type": "string"
        },
        "urls": {
          "title": "urls",
          "description": "List of URLs found in the document.",
          "type": "string"
        }
      },
      "required": [
        "language",
        "chapter_titles",
        "urls"
      ],
      "title": "DocumentAnnotation",
      "type": "object",
      "additionalProperties": false
    },
    "name": "document_annotation",
    "strict": true
  }
}
```
    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="document-annotation-prompt">Annotation Prompt (Optional)</SectionTab>

After defining your annotation schema, you may need to provide more context and instructions around the annotation and document at stake. We allow the passing of a `document_annotation_prompt` that will be used as a high level system prompt for the annotation step, providing further context and instructions on how the annotation should be done. An example of prompt would be:

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
document_annotation_prompt = """
Extract the following from the provided PDF document:
- Language (e.g., "English")
- All chapter/section titles (e.g., ["Abstract", "1 Introduction"])
- All URLs (e.g., ["https://example.com"])
Be precise and include only exact matches.
"""

```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript
const documentAnnotationPrompt = `
Extract the following from the provided PDF document:
- Language (e.g., "English")
- All chapter/section titles (e.g., ["Abstract", "1 Introduction"])
- All URLs (e.g., ["https://example.com"])
Be precise and include only exact matches.
`;
```

    </TabItem>
    <TabItem value="curl" label="curl">

```bash
"document_annotation_prompt": "Extract the following from the provided PDF document:\n- Language (e.g., \"English\")\n- All chapter/section titles (e.g., [\"Abstract\", \"1 Introduction\"])\n- All URLs (e.g., [\"https://example.com\"])\nBe precise and include only exact matches."
```

    </TabItem>
</Tabs>

In production, you may want to provide context about the use case and refine instructions further if the output doesn’t match expectations exactly.

<SectionTab as="h3" variant="secondary" sectionId="document-start-request">Start Request</SectionTab>

Next, make a request and ensure the response adheres to the defined structures using `document_annotation_format` set to the corresponding schemas:

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
import os
from mistralai import Mistral, DocumentURLChunk, ImageURLChunk, ResponseFormat
from mistralai.extra import response_format_from_pydantic_model

api_key = os.environ["MISTRAL_API_KEY"]

client = Mistral(api_key=api_key)

# Client call
response = client.ocr.process(
    model="mistral-ocr-latest",
    pages=list(range(8)),
    document=DocumentURLChunk(
      document_url="https://arxiv.org/pdf/2410.07073"
    ),
    document_annotation_format=response_format_from_pydantic_model(Document),
    # document_annotation_prompt=document_annotation_prompt,
    include_image_base64=True
  )
```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

async function processDocument() {
  try {
    const response = await client.ocr.process({
      model: "mistral-ocr-latest",
      pages: Array.from({ length: 8 }, (_, i) => i), // Creates an array [0, 1, 2, ..., 7]
      document: {
        type: "document_url",
        documentUrl: "https://arxiv.org/pdf/2410.07073"
      },
      documentAnnotationFormat: responseFormatFromZodObject(DocumentSchema),
      // documentAnnotationPrompt: documentAnnotationPrompt,
      includeImageBase64: true,
    });

    console.log(response);
  } catch (error) {
    console.error("Error processing document:", error);
  }
}

processDocument();
```

    </TabItem>
    <TabItem value="curl" label="curl">

```bash
curl --location 'https://api.mistral.ai/v1/ocr' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${MISTRAL_API_KEY}" \
--data '{
    "model": "mistral-ocr-latest",
    "document": {"document_url": "https://arxiv.org/pdf/2410.07073"},
    "pages": [0, 1, 2, 3, 4, 5, 6, 7],
    "document_annotation_format": {
        "type": "json_schema",
        "json_schema": {
            "schema": {
                "properties": {
                    "language": {"title": "Language", "description": "The language of the document.", "type": "string"},
                    "chapter_titles": {"title": "Chapter_Titles", "description": "List of chapter titles found in the document.", "type": "string"},
                    "urls": {"title": "urls", "description": "List of URLs found in the document.", "type": "string"}
                },
                "required": ["language", "chapter_titles", "urls"],
                "title": "DocumentAnnotation",
                "type": "object",
                "additionalProperties": false
            },
            "name": "document_annotation",
            "strict": true
        }
    },
    "include_image_base64": true
}'
```

    </TabItem>
    <TabItem value="output" label="output">

```json
{
  "pages": [
    {
      "index": 0,
      "markdown": "# Pixtral 12B \n\n![img-0.jpeg](img-0.jpeg)\n\n## Abstract\n\nWe introduce Pixtral 12B, a 12-billion-parameter multimodal language model. Pixtral 12B is trained to understand both natural images and documents, achieving leading performance on various multimodal benchmarks, surpassing a number of larger models. Unlike many open-source models, Pixtral is also a cutting-edge text model for its size, and does not compromise on natural language performance to excel in multimodal tasks. Pixtral uses a new vision encoder trained from scratch, which allows it to ingest images at their natural resolution and aspect ratio. This gives users flexibility on the number of tokens used to process an image. Pixtral is also able to process any number of images in its long context window of 128 K tokens. Pixtral 12B substanially outperforms other open models of similar sizes (Llama-3.2 11B \\& Qwen-2-VL 7B). It also outperforms much larger open models like Llama-3.2 90B while being 7x smaller. We further contribute an open-source benchmark, MM-MT-Bench, for evaluating vision-language models in practical scenarios, and provide detailed analysis and code for standardized evaluation protocols for multimodal LLMs. Pixtral 12B is released under Apache 2.0 license.\n\nWebpage: https://mistral.ai/news/pixtral-12b/\nInference code: https://github.com/mistralai/mistral-inference/\nEvaluation code: https://github.com/mistralai/mistral-evals/\n\n## 1 Introduction\n\nThis paper describes Pixtral 12B, a multimodal language model trained to understand both images and text, released with open weights under an Apache 2.0 license. Pixtral is an instruction tuned model which is pretrained on large scale interleaved image and text documents, and hence is capable of multi-turn, multi-image conversation.\n\nPixtral comes with a new vision encoder which is trained with a novel RoPE-2D implementation, allowing it to process images at their native resolution and aspect ratio. In this way, the model can flexibly process images at low resolution in latency-constrained settings, while processing images at high resolution when fine-grained reasoning is required.\nWhen compared against models of a similar size in the same evaluation setting, we find that Pixtral delivers strong multimodal reasoning capabilities without sacrificing text-only reasoning performance.",
      "images": [
        {
          "id": "img-0.jpeg",
          "top_left_x": 413,
          "top_left_y": 563,
          "bottom_right_x": 1286,
          "bottom_right_y": 862,
          "image_base64": "data:image/jpeg;base64,...",
          "image_annotation": null
        }
      ],
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    {
      "index": 1,
      "markdown": "![img-1.jpeg](img-1.jpeg)\n\nFigure 1: Pixtral Performance. Pixtral outperforms all open-models within its weight class on multimodal tasks by a substantial margin. Left: Performance on MM-MT-Bench, a new multimodal, multiturn, instruction following benchmark designed to reflect real world usage of multimodal language models. Right: Performance on the public LMSys leaderboard (Vision arena, October 2024).\n\nFor instance, our model matches or exceeds the performance of models like Qwen2-VL 7B [23] and Llama-3.2 11B [6] on popular multimodal benchmarks like MMMU [24] and MathVista [14], while outperforming most open-source models on popular text-only tasks like MATH [7] and HumanEval [26]. Pixtral even outperforms much larger models like Llama-3.2 90B [6], as well as closed models such as Claude-3 Haiku [1] and Gemini-1.5 Flash 8B [18], on multimodal benchmarks.\n\nDuring evaluation of Pixtral and the baselines, we found that evaluation protocols for multimodal language models is not standardized, and that small changes in the setup can dramatically change the performance of some models. We provide thorough analysis of our experience in re-evaluating vision-language models under a common evaluation protocol.\n\nSpecifically, we identify two issues with evaluation:\n\n- Prompts: Several benchmarks have default prompts which are under-specified, and dramatically reduce the performance of leading closed source models [16, 1] compared to reported figures.\n- Evaluation Metrics: The official metrics typically require exact match, which score model generations as correct only if they exactly match the reference answer. However, this metric penalizes answers which are substantively correct but in a slightly different format (e.g., \"6.0\" vs \"6\").\n\nTo alleviate these issues, we propose 'Explicit' prompts that explicitly specify the format required by the reference answer. We further analyze the impact of flexible parsing for various models, releasing the evaluation code and prompts in an effort to establish fair and standardized evaluation protocols ${ }^{1}$.\n\nMoreover, while current multimodal benchmarks mostly evaluate short-form or multiple-choice question answering given an input image, they do not fully capture a model's utility for practical use cases (e.g. in a multi-turn, long-form assistant setting). To address this, we open-source a novel multimodal, multi-turn evaluation: MM-MT-Bench ${ }^{2}$. We find that performance on MM-MT-Bench correlates highly with ELO rankings on the LMSys Vision Leaderboard.\n\nPixtral excels at multimodal instruction following, surpassing comparable open-source models on the MM-MT-Bench benchmark (see Figure 1). Based on human preferences on the LMSys Vision Leaderboard, Pixtral 12B is currently the highest ranked Apache 2.0 model, substantially outperforming other open-models such Llama-3.2 11B [6] and Qwen2-VL 7B [23]. It even ranks higher than several closed models such as Claude-3 Opus \\& Claude-3 Sonnet [1], and several larger models such as Llama-3.2 90B [6].\n\n[^0]\n[^0]:    ${ }^{1}$ https://github.com/mistralai/mistral-evals/\n    ${ }^{2}$ https://huggingface.co/datasets/mistralai/MM-MT-Bench",
      "images": [
        {
          "id": "img-1.jpeg",
          "top_left_x": 294,
          "top_left_y": 193,
          "bottom_right_x": 1405,
          "bottom_right_y": 675,
          "image_base64": "...",
          "image_annotation": null
        }
      ],
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    },
    ...
    {
      "index": 7,
      "markdown": "|  | Llama-3.2 11B [21] | Llama-3.2 90B [21] | Qwen2-VL 7B [23] | Pixtral 12B |\n| :-- | :-- | :-- | :-- | :-- |\n| Mathvista |  |  |  |  |\n| Baseline | 24.3 | 49.1 | 53.7 | $\\mathbf{5 8 . 3}$ |\n| Flexible level 1 | 25.9 | 50.3 | 54.3 | $\\mathbf{5 8 . 3}$ |\n| Flexible level 2 | 40.2 | 54.7 | 54.3 | $\\mathbf{5 8 . 3}$ |\n| Flexible level 3 | 47.9 | 57.3 | 55.2 | $\\mathbf{5 8 . 5}$ |\n| MMMU |  |  |  |  |\n| Baseline | 23.0 | $\\mathbf{5 3 . 7}$ | 48.1 | 52.0 |\n| Flexible level 1 | 23.4 | $\\mathbf{5 3 . 7}$ | 48.1 | 52.0 |\n| Flexible level 2 | 41.0 | $\\mathbf{5 5 . 7}$ | 48.1 | 52.0 |\n| Flexible level 3 | 45.3 | $\\mathbf{5 6 . 7}$ | 48.7 | 52.0 |\n| ChartQA |  |  |  |  |\n| Baseline | 14.8 | 33.8 | 41.2 | $\\mathbf{8 1 . 8}$ |\n| Flexible level 1 | 20.4 | 33.9 | 73.8 | $\\mathbf{8 1 . 9}$ |\n| Flexible level 2 | 29.9 | 35.6 | 73.8 | $\\mathbf{8 1 . 9}$ |\n| Flexible level 3 | 78.5 | 79.1 | 77.5 | $\\mathbf{8 2 . 0}$ |\n\nTable 5: Flexible parsing ablations. We evaluate models under progressively looser parsing constraints (see Appendix C for details). Under loose parsing constraints, the performance of some models dramatically improves. Pixtral 12B performance is stable under all parsing conditions, and continues to lead even when flexible parsing is accounted for. 'Flexible Level 3' is included for illustration only, as it allows some incorrect answers to be marked as correct.\n![img-6.jpeg](img-6.jpeg)\n\nFigure 6: Vision encoder ablations: When leveraged for visual instruction tuning, our encoder substantially outperforms a strong CLIPA [10] baseline for tasks requiring fine-grained document understanding, while maintaining parity for natural images.\nhere note that 'Flexible Level 3' marks a response as correct if the reference answer occurs anywhere in the generation. This is an overly generous metric which is included only to illustrate an upper bound, as it permits answers like \"6000\" for a reference answer of \"6\".\nWe provide the results of our analysis in Table 5. We find that the performance of some models dramatically improves with more flexible parsing metrics, indicating that the lower scores can be attributed to the inability of models to properly follow prompt instructions. We further note that Pixtral 12B benefits very little from flexible parsing (substantiating its ability to follow instructions), and furthermore can generally outperform other models even after flexible metrics are used.\n\n# 4.4 Vision Encoder Ablations \n\nIn order to verify the design choices for our vision encoder, we conduct small-scale ablations with Visual Instruction Tuning [13]. We conduct short-horizon multimodal instruction-tuning runs, both with our vision encoder (Pixtral-ViT), as well as a CLIPA [10] backbone as a baseline. For both vision encoders, we use Mistral-Nemo 12B-Instruct [15] to initialize the multimodal decoder.",
      "images": [
        {
          "id": "img-6.jpeg",
          "top_left_x": 516,
          "top_left_y": 946,
          "bottom_right_x": 1183,
          "bottom_right_y": 1375,
          "image_base64": "...",
          "image_annotation": null
        }
      ],
      "dimensions": {
        "dpi": 200,
        "height": 2200,
        "width": 1700
      }
    }
  ],
  "model": "mistral-ocr-2505-completion",
  "document_annotation": "{\n\"language\": \"English\",\n\"chapter_titles\": \"Pixtral 12B, Abstract, 1 Introduction, 2 Architectural details, 2.1 Multimodal Decoder, 2.2 Vision Encoder, 2.3 Complete architecture, 3 MM-MT-Bench: A benchmark for multi-modal instruction following, 4 Results, 4.1 Main Results, 4.2 Prompt selection, 4.3 Sensitivity to evaluation metrics, 4.4 Vision Encoder Ablations\",\n\"urls\": \"https://mistral.ai/news/pixtal-12b/, https://github.com/mistralai/mistral-inference/, https://github.com/mistralai/mistral-evals/, https://huggingface.co/datasets/mistralai/MM-MT-Bench, https://github.com/mistralai/mistral-evals/\"\n}",
  "usage_info": {
    "pages_processed": 8,
    "doc_size_bytes": 12640953
  }
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="document-example-output">Document Annotation Example Output</SectionTab>

The Document Annotation feature allows to extract data and annotate documents, below you have an example of the annotation output:

```json
{
  "language": "English",
  "chapter_titles": [
    "Abstract",
    "1 Introduction",
    "2 Architectural details",
    "2.1 Multimodal Decoder",
    "2.2 Vision Encoder",
    "2.3 Complete architecture",
    "3 MM-MT-Bench: A benchmark for multi-modal instruction following",
    "4 Results",
    "4.1 Main Results",
    "4.2 Prompt selection",
    "4.3 Sensitivity to evaluation metrics",
    "4.4 Vision Encoder Ablations"
  ],
  "urls": [
    "https://mistral.ai/news/pixtal-12b/",
    "https://github.com/mistralai/mistral-inference/",
    "https://github.com/mistralai/mistral-evals/",
    "https://huggingface.co/datasets/mistralai/MM-MT-Bench"
  ]
} 
```
  </ExplorerTab>
  <ExplorerTab value="bbox-document-annotation" label="BBox and Document Annotation">
    Below you can find an example of how to use the `bbox_annotation_format` and `document_annotation_format` together to extract information from a document.

<SectionTab as="h3" variant="secondary" sectionId="bbox-document-define-the-data-model">Define the Data Model</SectionTab>

First, define the response formats for `BBox Annotation`, using either Pydantic or Zod schemas for our SDKs, or a JSON schema for a curl API call.

Pydantic/Zod/JSON schemas accept nested objects, arrays, enums, etc...

<Tabs groupId="code">
  <TabItem value="python" label="python" default>

```python
from pydantic import BaseModel

# BBOX Annotation response format
class Image(BaseModel):
  image_type: str
  short_description: str
  summary: str

# Document Annotation response format
class Document(BaseModel):
  language: str
  chapter_titles: list[str]
  urls: list[str]
```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript

// BBOX Annotation response format
const ImageSchema = z.object({
  image_type: z.string(),
  short_description: z.string(),
  summary: z.string(),
});

// Document Annotation response format
const DocumentSchema = z.object({
  language: z.string(),
  chapter_titles: z.array(z.string()),
  urls: z.array(z.string()),
});
```

    </TabItem>
    <TabItem value="curl" label="curl">

```json
"bbox_annotation_format": {
  "type": "json_schema",
  "json_schema": {
    "schema": {
      "properties": {
        "document_type": {
          "title": "Document_Type",
          "type": "string"
        },
        "short_description": {
          "title": "Short_Description",
          "type": "string"
        },
        "summary": {
          "title": "Summary",
          "type": "string"
        }
      },
      "required": [
        "document_type",
        "short_description",
        "summary"
      ],
      "title": "BBOXAnnotation",
      "type": "object",
      "additionalProperties": false
    },
    "name": "bbox_annotation",
    "strict": true
  }
},
"document_annotation_format": {
  "type": "json_schema",
  "json_schema": {
    "schema": {
      "properties": {
        "language": {
          "title": "Language",
          "type": "string"
        },
        "chapter_titles": {
          "title": "Chapter_Titles",
          "type": "string"
        },
        "urls": {
          "title": "urls",
          "type": "string"
        }
      },
      "required": [
        "language",
        "chapter_titles",
        "urls"
      ],
      "title": "DocumentAnnotation",
      "type": "object",
      "additionalProperties": false
    },
    "name": "document_annotation",
    "strict": true
  }
}
```

    </TabItem>
</Tabs>

You can also provide a description for each entry, the description will be used as detailed information and instructions during the annotation; the following example will have a description for the BBox Annotation and not for the Document Annotation:

<Tabs groupId="code">
  <TabItem value="python" label="python" default>

```python
from pydantic import BaseModel, Field

# BBOX Annotation response format with description
class Image(BaseModel):
  image_type: str = Field(..., description="The type of the image.")
  short_description: str = Field(..., description="A description in english describing the image.")
  summary: str = Field(..., description="Summarize the image.")

# Document Annotation response format without description
class Document(BaseModel):
  language: str
  chapter_titles: list[str]
  urls: list[str]
```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript

// Define the schema for the Image type with descriptions
const ImageSchema = z.object({
  image_type: z.string().describe("The type of the image."),
  short_description: z.string().describe("A description in English describing the image."),
  summary: z.string().describe("Summarize the image."),
});

// Document Annotation response format without description
const DocumentSchema = z.object({
  language: z.string(),
  chapter_titles: z.array(z.string()),
  urls: z.array(z.string()),
});
```

    </TabItem>
    <TabItem value="curl" label="curl">

```json
"bbox_annotation_format": {
  "type": "json_schema",
  "json_schema": {
    "schema": {
      "properties": {
        "document_type": {
          "title": "Document_Type",
          "description": "The type of the image.",
          "type": "string"
        },
        "short_description": {
          "title": "Short_Description",
          "description": "A description in English describing the image.",
          "type": "string"
        },
        "summary": {
          "title": "Summary",
          "description": "Summarize the image.",
          "type": "string"
        }
      },
      "required": [
        "document_type",
        "short_description",
        "summary"
      ],
      "title": "BBOXAnnotation",
      "type": "object",
      "additionalProperties": false
    },
    "name": "document_annotation",
    "strict": true
  }
},
"document_annotation_format": {
  "type": "json_schema",
  "json_schema": {
    "schema": {
      "properties": {
        "language": {
          "title": "Language",
          "type": "string"
        },
        "chapter_titles": {
          "title": "Chapter_Titles",
          "type": "string"
        },
        "urls": {
          "title": "urls",
          "type": "string"
        }
      },
      "required": [
        "language",
        "chapter_titles",
        "urls"
      ],
      "title": "DocumentAnnotation",
      "type": "object",
      "additionalProperties": false
    },
    "name": "document_annotation",
    "strict": true
  }
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="bbox-document-annotation-prompt">Document Annotation Prompt (Optional)</SectionTab>

After defining your document annotation schema, you may need to provide more context and instructions around the annotation and document at stake. We allow the passing of a `document_annotation_prompt` that will be used as a high level system prompt for the annotation step, providing further context and instructions on how the annotation should be done. An example of prompt would be:

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
document_annotation_prompt = """
Extract the following from the provided PDF document:
- Language (e.g., "English")
- All chapter/section titles (e.g., ["Abstract", "1 Introduction"])
- All URLs (e.g., ["https://example.com"])
Be precise and include only exact matches.
"""

```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript
const documentAnnotationPrompt = `
Extract the following from the provided PDF document:
- Language (e.g., "English")
- All chapter/section titles (e.g., ["Abstract", "1 Introduction"])
- All URLs (e.g., ["https://example.com"])
Be precise and include only exact matches.
`;
```

    </TabItem>
    <TabItem value="curl" label="curl">

```bash
"document_annotation_prompt": "Extract the following from the provided PDF document:\n- Language (e.g., \"English\")\n- All chapter/section titles (e.g., [\"Abstract\", \"1 Introduction\"])\n- All URLs (e.g., [\"https://example.com\"])\nBe precise and include only exact matches."
```

    </TabItem>
</Tabs>

In production, you may want to provide context about the use case and refine instructions further if the output doesn’t match expectations exactly.

<SectionTab as="h3" variant="secondary" sectionId="bbox-document-start-request">Start Request</SectionTab>

Next, make a request and ensure the response adheres to the defined structures using `bbox_annotation_format` and `document_annotation_format` set to the corresponding schemas:

<Tabs groupId="code">
  <TabItem value="python" label="python" default>

```python
import os
from mistralai import Mistral, DocumentURLChunk, ImageURLChunk, ResponseFormat
from mistralai.extra import response_format_from_pydantic_model

api_key = os.environ["MISTRAL_API_KEY"]

client = Mistral(api_key=api_key)

# Client call
response = client.ocr.process(
    model="mistral-ocr-latest",
    pages=list(range(8)),
    document=DocumentURLChunk(
      document_url="https://arxiv.org/pdf/2410.07073"
    ),
    bbox_annotation_format=response_format_from_pydantic_model(Image),
    document_annotation_format=response_format_from_pydantic_model(Document),
    # document_annotation_prompt=document_annotation_prompt,
    include_image_base64=True
  )
```

    </TabItem>
    <TabItem value="typescript" label="typescript" default>

```typescript

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

async function processDocument() {
  try {
    const response = await client.ocr.process({
      model: "mistral-ocr-latest",
      pages: Array.from({ length: 8 }, (_, i) => i), // Creates an array [0, 1, 2, ..., 7]
      document: {
        type: "document_url",
        documentUrl: "https://arxiv.org/pdf/2410.07073"
      },
      bboxAnnotationFormat: responseFormatFromZodObject(ImageSchema),
      documentAnnotationFormat: responseFormatFromZodObject(DocumentSchema),
      // documentAnnotationPrompt: documentAnnotationPrompt,
      includeImageBase64: true,
    });

    console.log(response);
  } catch (error) {
    console.error("Error processing document:", error);
  }
}

processDocument();
```

    </TabItem>
    <TabItem value="curl" label="curl">

```bash
curl --location 'https://api.mistral.ai/v1/ocr' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer ${MISTRAL_API_KEY}" \
--data '{
    "model": "mistral-ocr-latest",
    "document": {"document_url": "https://arxiv.org/pdf/2410.07073"},
    "bbox_annotation_format": {
        "type": "json_schema",
        "json_schema": {
            "schema": {
                "properties": {
                    "document_type": {"title": "Document_Type", "description": "The type of the image.", "type": "string"},
                    "short_description": {"title": "Short_Description", "description": "A description in English describing the image.", "type": "string"},
                    "summary": {"title": "Summary", "description": "Summarize the image.", "type": "string"}
                },
                "required": ["document_type", "short_description", "summary"],
                "title": "BBOXAnnotation",
                "type": "object",
                "additionalProperties": false
            },
            "name": "document_annotation",
            "strict": true
        }
    },
     "document_annotation_format": {
        "type": "json_schema",
        "json_schema": {
            "schema": {
                "properties": {
                    "language": {"title": "Language", "type": "string"},
                    "chapter_titles": {"title": "Chapter_Titles", "type": "string"},
                    "urls": {"title": "urls", "type": "string"}
                },
                "required": ["language", "chapter_titles", "urls"],
                "title": "DocumentAnnotation",
                "type": "object",
                "additionalProperties": false
            },
            "name": "document_annotation",
            "strict": true
        }
    },
    "include_image_base64": true
}'
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="bbox-document-example-output">BBox and Document Annotation Example Output</SectionTab>

The BBox and Document Annotation features allows to extract data and annotate images that were extracted from the original document and the full document, below you have one of the images of a document extracted by our OCR Processor.

<div style={{ textAlign: 'center' }}>
  <img
    src="/img/img-1.jpeg"
    alt="bbox-image"
    width="800"
    style={{ borderRadius: '15px' }}
    className='mx-auto' 
  />
</div>

The Image extracted is provided in a base64 encoded format.

```json
{ 
  "image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGB{LONG_MIDDLE_SEQUENCE}KKACiiigAooooAKKKKACiiigD//2Q==..." 
}
```

And you can annotate the image with the model schema you want, below you have an example output.

```json
{
  "image_type": "scatter plot",
  "short_description": "Comparison of different models based on performance and cost.",
  "summary": "The image consists of two scatter plots comparing various models on two different performance metrics against their cost or number of parameters. The left plot shows performance on the MM-MT-Bench, while the right plot shows performance on the LMSys-Vision ELO. Each point represents a different model, with the x-axis indicating the cost or number of parameters in billions (B) and the y-axis indicating the performance score. The shaded region in both plots highlights the best performance/cost ratio, with Pixtral 12B positioned within this region in both plots, suggesting it offers a strong balance of performance and cost efficiency. Other models like Qwen-2-VL 72B and Qwen-2-VL 7B also show high performance but at varying costs."
}
```

The Document Annotation will provide you with the full document annotation, below you have an example output.

```json
{
  "language": "English",
  "chapter_titles": [
    "Abstract",
    "1 Introduction",
    "2 Architectural details",
    "2.1 Multimodal Decoder",
    "2.2 Vision Encoder",
    "2.3 Complete architecture",
    "3 MM-MT-Bench: A benchmark for multi-modal instruction following",
    "4 Results",
    "4.1 Main Results",
    "4.2 Prompt selection",
    "4.3 Sensitivity to evaluation metrics",
    "4.4 Vision Encoder Ablations"
  ],
  "urls": [
    "https://mistral.ai/news/pixtal-12b/",
    "https://github.com/mistralai/mistral-inference/",
    "https://github.com/mistralai/mistral-evals/",
    "https://huggingface.co/datasets/mistralai/MM-MT-Bench"
  ]
} 
```
  </ExplorerTab>
</ExplorerTabs>

<SectionTab as="h1" sectionId="cookbooks">Cookbooks</SectionTab>

For more information and guides on how to make use of OCR, we have the following cookbooks:
- [Data Extraction with Structured Outputs](https://colab.research.google.com/github/mistralai/cookbook/blob/main/mistral/ocr/data_extraction.ipynb)

<SectionTab as="h1" sectionId="faq">FAQ</SectionTab>

<Faq>
<FaqItem question="Are there any limits regarding the Document AI API?">
Yes, there are certain limitations for the Document Intelligence API. Uploaded document files must not exceed 50 MB in size and should be no longer than 1,000 pages.
</FaqItem>
<FaqItem question="Are there any limits regarding the Annotations?">
When using Document Annotations, each annotation accepts a maximum of 8 image bounding boxes. We recommend using document annotation for text-focused documents.
</FaqItem>
</Faq>

---
id: document_qna
title: Document QnA
slug: document_qna
sidebar_position: 3.3
---

# Document AI QnA

The Document QnA capability combines OCR with large language model capabilities to enable natural language interaction with document content. This allows you to extract information and insights from documents by asking questions in natural language.

:::tip
Before continuing, we recommend reading the [Chat Completions](../completion) documentation to learn more about the chat completions API and how to use it before proceeding.
:::

<SectionTab as="h1" sectionId="before-you-start">Before You Start</SectionTab>

### Workflow and Capabilities

The workflow consists of two main steps:

<div style={{ textAlign: 'center' }}>
  <img
    src="/img/document_qna.png"
    alt="Document QnA Graph"
    width="800"
    style={{ borderRadius: '15px' }}
    className='mx-auto' 
  />
</div>

1. Document Processing: OCR extracts text, structure, and formatting, creating a machine-readable version of the document.

2. Language Model Understanding: The extracted document content is analyzed by a large language model. You can ask questions or request information in natural language. The model understands context and relationships within the document and can provide relevant answers based on the document content.

<SectionTab as="h2" variant="secondary" sectionId="workflow-key-capabilities">Key Capabilities</SectionTab>

- Question answering about specific document content
- Information extraction and summarization
- Document analysis and insights
- Multi-document queries and comparisons
- Context-aware responses that consider the full document

<SectionTab as="h2" variant="secondary" sectionId="common-use-cases">Common Use Cases</SectionTab>

- Analyzing research papers and technical documents
- Extracting information from business documents
- Processing legal documents and contracts
- Building document Q&A applications
- Automating document-based workflows

<SectionTab as="h1" sectionId="usage">Usage</SectionTab>

### Leverage Document QnA

The examples below show how to interact with a PDF document using natural language.

<ExplorerTabs id="qna-usage">
    <ExplorerTab value="qna-pdf-url" label="QnA with a PDF Url">
        Be sure the URL is **public** and accessible by our API.

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]
model = "mistral-small-latest"

client = Mistral(api_key=api_key)

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "what is the last sentence in the document"
            },
            {
                "type": "document_url",
                "document_url": "https://arxiv.org/pdf/1805.04770"
            }
        ]
    }
]

chat_response = client.chat.complete(
    model=model,
    messages=messages
)
```

    </TabItem>
    <TabItem value="typescript" label="typescript">

```typescript

const apiKey = process.env["MISTRAL_API_KEY"];

const client = new Mistral({
  apiKey: apiKey,
});

const chatResponse = await client.chat.complete({
  model: "mistral-small-latest",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "what is the last sentence in the document",
        },
        {
          type: "document_url",
          documentUrl: "https://arxiv.org/pdf/1805.04770",
        },
      ],
    },
  ],
});
```

    </TabItem>
    <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
  -d '{
    "model": "mistral-small-latest",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "what is the last sentence in the document"
          },
          {
            "type": "document_url",
            "document_url": "https://arxiv.org/pdf/1805.04770"
          }
        ]
      }
    ]
  }'
```

    </TabItem>
    <TabItem value="output" label="output">

```json
{
  "id": "7b98be65bb7b475ca2456a92f9ed0049",
  "created": 1756753708,
  "model": "mistral-small-latest",
  "usage": {
    "prompt_tokens": 13707,
    "total_tokens": 13764,
    "completion_tokens": 57
  },
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "tool_calls": null,
        "content": "The last sentence in the document is:\n\n\"Zaremba, W., Sutskever, I., and Vinyals, O. Recurrent neural network regularization. arXiv:1409.2329, 2014.\""
      }
    }
  ]
}
```

    </TabItem>
</Tabs>
    </ExplorerTab>
    <ExplorerTab value="qna-base64-encoded-pdf" label="QnA with a Base64 Encoded PDF">
        You can perform QnA with any PDF by encoding them in base64 and sending them as part of the chat completion request.

<Tabs groupId="code">
    <TabItem value="python" label="python" default>

```python
import base64
import os
from mistralai import Mistral

api_key = os.environ["MISTRAL_API_KEY"]
model = "mistral-small-latest"

client = Mistral(api_key=api_key)

def encode_pdf(pdf_path):
    with open(pdf_path, "rb") as pdf_file:
        return base64.b64encode(pdf_file.read()).decode('utf-8')

pdf_path = "path_to_your_pdf.pdf"
base64_pdf = encode_pdf(pdf_path)

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "what is the last sentence in the document"
            },
            {
                "type": "document_url",
                "document_url": f"data:application/pdf;base64,{base64_pdf}" 
            }
        ]
    }
]

chat_response = client.chat.complete(
    model=model,
    messages=messages
)
```

    </TabItem>
    <TabItem value="typescript" label="typescript">

```typescript

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

async function encodePdf(pdfPath) {
    const pdfBuffer = fs.readFileSync(pdfPath);
    const base64Pdf = pdfBuffer.toString('base64');
    return base64Pdf;
}

const pdfPath = "path_to_your_pdf.pdf";
const base64Pdf = await encodePdf(pdfPath);

const chatResponse = await client.chat.complete({
  model: "mistral-small-latest",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "what is the last sentence in the document",
        },
        {
          type: "document_url",
          documentUrl: "data:application/pdf;base64," + base64Pdf,
        },
      ],
    },
  ],
});
```

    </TabItem>
    <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
  -d '{
    "model": "mistral-small-latest",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "what is the last sentence in the document"
          },
          {
            "type": "document_url",
            "document_url": "data:application/pdf;base64,<base64_pdf>"
          }
        ]
      }
    ]
  }'
```

    </TabItem>
    <TabItem value="output" label="output">

```json
{
  "id": "7b98be65bb7b475ca2456a92f9ed0049",
  "created": 1756753708,
  "model": "mistral-small-latest",
  "usage": {
    "prompt_tokens": 13707,
    "total_tokens": 13764,
    "completion_tokens": 57
  },
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "tool_calls": null,
        "content": "The last sentence in the document is:\n\n\"Zaremba, W., Sutskever, I., and Vinyals, O. Recurrent neural network regularization. arXiv:1409.2329, 2014.\""
      }
    }
  ]
}
```

    </TabItem>
</Tabs>
    </ExplorerTab>
    <ExplorerTab value="qna-with-uploaded-pdf" label="QnA with an Uploaded PDF">
        You can also upload a PDF file in our Cloud and get the QnA results from the uploaded PDF by retrieving a signed url. Document QnA is under the umbrela OCR, the method for uploading and handling files will hence be the same.

<SectionTab as="h3" variant="secondary" sectionId="upload-a-file">Upload a File</SectionTab>

First, you will have to upload your PDF file to our cloud, this file will be stored and only accessible via an API key.

<Tabs groupId="code">
  <TabItem value="python" label="python" default>

```python
from mistralai import Mistral
import os

api_key = os.environ["MISTRAL_API_KEY"]

client = Mistral(api_key=api_key)

uploaded_pdf = client.files.upload(
    file={
        "file_name": "2201.04234v3.pdf",
        "content": open("2201.04234v3.pdf", "rb"),
    },
    purpose="ocr"
)  
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({apiKey: apiKey});

const uploadedFile = fs.readFileSync('2201.04234v3.pdf');
const uploadedPdf = await client.files.upload({
    file: {
        fileName: "2201.04234v3.pdf",
        content: uploadedFile,
    },
    purpose: "ocr"
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/files \
  -H "Authorization: Bearer $MISTRAL_API_KEY" \
  -F purpose="ocr" \
  -F file="@2201.04234v3.pdf"
```

  </TabItem>
  <TabItem value="output" label="output">

```json
{
  "id": "9a90b93c-0e7d-4dd7-8520-07d051404d11",
  "object": "file",
  "bytes": 560027,
  "created_at": 1756754478,
  "filename": "1805.04770v2.pdf",
  "purpose": "ocr",
  "sample_type": "ocr_input",
  "num_lines": 0,
  "mimetype": "application/pdf",
  "source": "upload",
  "signature": "..."
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="retrieve-file">Retrieve File</SectionTab>

Once the file uploaded, you can retrieve it at any point.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
retrieved_file = client.files.retrieve(file_id=uploaded_pdf.id)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript
const retrievedFile = await client.files.retrieve({
    fileId: uploadedPdf.id
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl -X GET "https://api.mistral.ai/v1/files/$id" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer $MISTRAL_API_KEY"
```

  </TabItem>

  <TabItem value="output" label="output">

```json
{
  "id": "9a90b93c-0e7d-4dd7-8520-07d051404d11",
  "object": "file",
  "bytes": 560027,
  "created_at": 1756754478,
  "filename": "1805.04770v2.pdf",
  "purpose": "ocr",
  "sample_type": "ocr_input",
  "num_lines": 0,
  "mimetype": "application/pdf",
  "source": "upload",
  "signature": "...",
  "deleted": false
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="get-signed-url">Get Signed Url</SectionTab>

For QnA with Documents, you can get a signed url to access the file. An optional `expiry` parameter allow you to automatically expire the signed url after n hours.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
signed_url = client.files.get_signed_url(file_id=uploaded_pdf.id)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript
const signedUrl = await client.files.getSignedUrl({
    fileId: uploadedPdf.id,
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl -X GET "https://api.mistral.ai/v1/files/$id/url?expiry=24" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer $MISTRAL_API_KEY"
```

  </TabItem>

  <TabItem value="output" label="output">

```json
{
  "url": "https://mistralaifilesapiprodswe.blob.core.windows.net/fine-tune/.../.../9a90b93c0e7d4dd7852007d051404d11.pdf?se=2025-09-02T19%3A22%3A08Z&sp=r&sv=2025-01-05&sr=b&sig=..."
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="get-chat-completion-results">Get Chat Completion Result</SectionTab>

You can now query any LLM with the signed url.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
model =  "mistral-small-latest"

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "text",
                "text": "what is the last sentence in the document"
            },
            {
                "type": "document_url",
                "document_url": signed_url.url
            }
        ]
    }
]

chat_response = client.chat.complete(
    model=model,
    messages=messages
)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript
const chatResponse = await client.chat.complete({
  model: "mistral-small-latest",
  messages: [
    {
      role: "user",
      content: [
        {
          type: "text",
          text: "what is the last sentence in the document",
        },
        {
          type: "document_url",
          documentUrl: signedUrl.url,
        },
      ],
    },
  ],
});
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl https://api.mistral.ai/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MISTRAL_API_KEY}" \
  -d '{
    "model": "mistral-small-latest",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "what is the last sentence in the document"
          },
          {
            "type": "document_url",
            "document_url": "https://mistralaifilesapiprodswe.blob.core.windows.net/fine-tune/.../.../22e2e88f167d4f3d982aadd977a54ec3.pdf?se=2025-08-30T10%3A53%3A22Z&sp=r&sv=2025-01-05&sr=b&sig=..."
          }
        ]
      }
    ]
  }'
```

    </TabItem>
    <TabItem value="output" label="output">

```json
{
  "id": "4ccfdc97996241eb9fe4375d947c671b",
  "created": 1756754528,
  "model": "mistral-small-latest",
  "usage": {
    "prompt_tokens": 13707,
    "total_tokens": 13764,
    "completion_tokens": 57
  },
  "object": "chat.completion",
  "choices": [
    {
      "index": 0,
      "finish_reason": "stop",
      "message": {
        "role": "assistant",
        "tool_calls": null,
        "content": "The last sentence in the document is:\n\n\"Zaremba, W., Sutskever, I., and Vinyals, O. Recurrent neural network regularization. arXiv:1409.2329, 2014.\""
      }
    }
  ]
}
```

    </TabItem>
</Tabs>

<SectionTab as="h3" variant="secondary" sectionId="delete-file">Delete File</SectionTab>

Once everything done, you can optionally delete the pdf file from our cloud unless you wish to reuse it later.

<Tabs groupId="code">
  <TabItem value="python" label="python">

```python
client.files.delete(file_id=file.id)
```

  </TabItem>
  <TabItem value="typescript" label="typescript">

```typescript
await client.files.delete(fileId=file.id);
```

  </TabItem>
  <TabItem value="curl" label="curl">

```bash
curl -X DELETE https://api.mistral.ai/v1/files/${file_id} \
-H "Authorization: Bearer ${MISTRAL_API_KEY}"
```

  </TabItem>
  <TabItem value="output" label="output">

```json
{
  "id": "9a90b93c-0e7d-4dd7-8520-07d051404d11",
  "object": "file",
  "deleted": true
}
```

  </TabItem>
</Tabs>
    </ExplorerTab>
</ExplorerTabs>

<SectionTab as="h1" sectionId="cookbooks">Cookbooks</SectionTab>

For more information on how to make use of Document QnA, we have the following [Document QnA Cookbook](https://colab.research.google.com/github/mistralai/cookbook/blob/main/mistral/ocr/document_understanding.ipynb) with a simple example.

<Faq>
  <FaqItem question="Are there any limits regarding the Document QnA API?">
    Yes, there are certain limitations for the Document QnA API. Uploaded document files must not exceed 50 MB in size and should be no longer than 1,000 pages.
  </FaqItem>
</Faq>